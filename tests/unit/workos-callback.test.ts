/**
 * WorkOS callback handler — session shaping regression tests.
 *
 * The callback exchanges ?code= with WorkOS and writes the identity into the
 * request session. The two behaviors we guard here:
 *
 *   1. session.isAdmin === true iff the returned email is in MASTER_ADMIN_EMAILS.
 *   2. session.tenantId === organizationId when WorkOS returns one, and falls
 *      back to user.id when it doesn't (single-user fallback for unmapped users).
 *
 * The @workos-inc/node SDK is fully mocked so no network calls leave the test
 * process. The session-store plumbing (Postgres, Redis) is also stubbed —
 * we call setup(app) against a capturing app stub and invoke the callback
 * handler directly with a fake req/res.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Express, Request, RequestHandler, Response } from "express";

// ---------- WorkOS SDK mock ----------
const authenticateWithCodeMock = vi.fn();
const getAuthorizationUrlMock = vi.fn(() => "https://workos.example/auth");

vi.mock("@workos-inc/node", () => ({
  WorkOS: class {
    userManagement = {
      authenticateWithCode: authenticateWithCodeMock,
      getAuthorizationUrl: getAuthorizationUrlMock,
    };
  },
}));

// Session store plumbing — we never actually use the returned middleware here,
// but buildSessionMiddleware is called from setup(), so its deps must load.
class StubStore {
  constructor(_opts: any) {}
  on() { return this; }
  off() { return this; }
  emit() { return true; }
  get(_sid: string, cb: any) { cb(null, null); }
  set(_sid: string, _sess: any, cb: any) { cb && cb(null); }
  destroy(_sid: string, cb: any) { cb && cb(null); }
}

vi.mock("connect-pg-simple", () => ({
  default: () => StubStore,
}));

vi.mock("connect-redis", () => ({
  RedisStore: StubStore,
}));

vi.mock("../../server/redis", () => ({
  getRedisClient: () => null,
}));

const upsertUserMock = vi.fn().mockResolvedValue({});
vi.mock("../../server/replit_integrations/auth/storage", () => ({
  authStorage: {
    upsertUser: upsertUserMock,
    getUser: vi.fn(),
  },
}));

vi.mock("../../server/db", () => ({
  db: {
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => ({ onConflictDoUpdate: () => ({ returning: () => [{}] }) }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [{}] }) }) }),
  },
  pool: {},
}));

// ---------- test helpers ----------

/**
 * A stub Express app that captures route handlers by path so we can invoke
 * them directly without spinning up an HTTP server.
 */
function captureApp() {
  const routes: Record<string, RequestHandler> = {};
  const app = {
    set: vi.fn(),
    use: vi.fn(),
    get: (path: string, handler: RequestHandler) => {
      routes[`GET ${path}`] = handler;
    },
    post: (path: string, handler: RequestHandler) => {
      routes[`POST ${path}`] = handler;
    },
  } as unknown as Express;
  return { app, routes };
}

function makeCallbackReqRes(code: string) {
  const session: any = {};
  // express-session exposes .destroy; not needed for callback but harmless.
  session.destroy = (cb: any) => cb && cb();
  const req = {
    query: { code },
    session,
  } as unknown as Request;

  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.redirect = vi.fn().mockReturnValue(res);

  return { req, res: res as Response & { status: any; json: any; redirect: any }, session };
}

async function setupAndGrabCallback() {
  // Fresh import each time so env reads take effect and handler closures bind
  // to the current mocks.
  vi.resetModules();
  const { workosProvider } = await import("../../server/auth/providers/workos");
  const { app, routes } = captureApp();
  await workosProvider.setup(app);
  const callback = routes["GET /api/callback"];
  if (!callback) throw new Error("callback route not registered");
  return callback;
}

// ---------- tests ----------

describe("WorkOS callback — session shaping", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    authenticateWithCodeMock.mockReset();
    upsertUserMock.mockClear();
    process.env.WORKOS_API_KEY = "sk_test_dummy";
    process.env.WORKOS_CLIENT_ID = "client_dummy";
    process.env.WORKOS_REDIRECT_URI = "http://localhost/api/callback";
    process.env.SESSION_SECRET = "test-secret";
    process.env.MASTER_ADMIN_EMAILS = "admin@example.com";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("sets session.isAdmin=true when email is in MASTER_ADMIN_EMAILS", async () => {
    authenticateWithCodeMock.mockResolvedValue({
      user: { id: "user_1", email: "admin@example.com", firstName: "Ada" },
      organizationId: "org_1",
    });

    const callback = await setupAndGrabCallback();
    const { req, res, session } = makeCallbackReqRes("the-code");
    await callback(req, res, vi.fn());

    expect(session.isAdmin).toBe(true);
    expect(session.email).toBe("admin@example.com");
    expect(res.redirect).toHaveBeenCalledWith("/");
  });

  it("sets session.isAdmin=false when email is NOT in MASTER_ADMIN_EMAILS", async () => {
    authenticateWithCodeMock.mockResolvedValue({
      user: { id: "user_2", email: "nobody@example.com" },
      organizationId: "org_2",
    });

    const callback = await setupAndGrabCallback();
    const { req, res, session } = makeCallbackReqRes("the-code");
    await callback(req, res, vi.fn());

    expect(session.isAdmin).toBe(false);
  });

  it("session.tenantId uses organizationId when WorkOS returns one", async () => {
    authenticateWithCodeMock.mockResolvedValue({
      user: { id: "user_3", email: "nobody@example.com" },
      organizationId: "org_with_id",
    });

    const callback = await setupAndGrabCallback();
    const { req, res, session } = makeCallbackReqRes("the-code");
    await callback(req, res, vi.fn());

    expect(session.tenantId).toBe("org_with_id");
    expect(session.organizationId).toBe("org_with_id");
  });

  it("session.tenantId falls back to user.id when organizationId is absent", async () => {
    authenticateWithCodeMock.mockResolvedValue({
      user: { id: "user_solo", email: "nobody@example.com" },
      organizationId: undefined,
    });

    const callback = await setupAndGrabCallback();
    const { req, res, session } = makeCallbackReqRes("the-code");
    await callback(req, res, vi.fn());

    expect(session.tenantId).toBe("user_solo");
    expect(session.organizationId).toBeUndefined();
  });

  it("returns 400 when ?code is missing", async () => {
    const callback = await setupAndGrabCallback();
    const { req, res } = makeCallbackReqRes("");
    await callback(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(authenticateWithCodeMock).not.toHaveBeenCalled();
  });
});
