/**
 * Master-admin middleware — regression tests.
 *
 * Guards the two exports in server/middleware/require-admin.ts:
 *   - requireMasterAdmin: 401 if no user, 403 if email not allowlisted, next() if it is.
 *   - requireMasterAdminOrTeam: same, plus a bypass when req.session.partnerId is set
 *     (partner sessions are team-scoped and allowed into the shared console).
 *
 * The allowlist comes from MASTER_ADMIN_EMAILS (pure env read via
 * @shared/models/auth::isMasterAdminEmail) — we override env per test instead of
 * mocking the function. authProvider.getCurrentUser is mocked so we don't need a
 * real session/WorkOS wiring.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";

const getCurrentUserMock = vi.fn();
const getPartnerSessionStateMock = vi.fn();

vi.mock("../../server/auth", () => ({
  authProvider: {
    getCurrentUser: (req: Request) => getCurrentUserMock(req),
  },
}));

vi.mock("../../server/middleware/partner-session", () => ({
  getPartnerSessionState: (req: Request) => getPartnerSessionStateMock(req),
}));

function makeRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response & { status: any; json: any };
}

describe("require-admin middleware", () => {
  const originalAllowlist = process.env.MASTER_ADMIN_EMAILS;

  beforeEach(() => {
    getCurrentUserMock.mockReset();
    getPartnerSessionStateMock.mockReset();
    getPartnerSessionStateMock.mockResolvedValue("none");
    process.env.MASTER_ADMIN_EMAILS = "admin@example.com";
  });

  afterEach(() => {
    process.env.MASTER_ADMIN_EMAILS = originalAllowlist;
  });

  describe("requireMasterAdmin", () => {
    it("returns 401 when no user is on the request", async () => {
      const { requireMasterAdmin } = await import("../../server/middleware/require-admin");
      getCurrentUserMock.mockReturnValue(null);

      const req = { session: {} } as unknown as Request;
      const res = makeRes();
      const next = vi.fn();

      requireMasterAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 403 when user email is not in the master allowlist", async () => {
      const { requireMasterAdmin } = await import("../../server/middleware/require-admin");
      getCurrentUserMock.mockReturnValue({ id: "u1", email: "random@example.com" });

      const req = { session: {} } as unknown as Request;
      const res = makeRes();
      const next = vi.fn();

      requireMasterAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next() when user email is in the master allowlist (case-insensitive)", async () => {
      const { requireMasterAdmin } = await import("../../server/middleware/require-admin");
      getCurrentUserMock.mockReturnValue({ id: "u1", email: "Admin@Example.COM" });

      const req = { session: {} } as unknown as Request;
      const res = makeRes();
      const next = vi.fn();

      requireMasterAdmin(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("requireMasterAdminOrTeam", () => {
    it("bypasses to next() when partner session is valid", async () => {
      const { requireMasterAdminOrTeam } = await import(
        "../../server/middleware/require-admin"
      );
      getPartnerSessionStateMock.mockResolvedValue("valid");
      getCurrentUserMock.mockReturnValue(null);

      const req = { session: { partnerId: "partner-abc" } } as unknown as Request;
      const res = makeRes();
      const next = vi.fn();

      await requireMasterAdminOrTeam(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
      expect(getCurrentUserMock).not.toHaveBeenCalled();
    });

    it("returns 403 when partner session is invalid (stale or forged)", async () => {
      const { requireMasterAdminOrTeam } = await import(
        "../../server/middleware/require-admin"
      );
      getPartnerSessionStateMock.mockResolvedValue("invalid");

      const req = { session: { partnerId: "ghost" } } as unknown as Request;
      const res = makeRes();
      const next = vi.fn();

      await requireMasterAdminOrTeam(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when no user and no partner session", async () => {
      const { requireMasterAdminOrTeam } = await import(
        "../../server/middleware/require-admin"
      );
      getCurrentUserMock.mockReturnValue(null);

      const req = { session: {} } as unknown as Request;
      const res = makeRes();
      const next = vi.fn();

      await requireMasterAdminOrTeam(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 403 when user is not a master admin and no partner session", async () => {
      const { requireMasterAdminOrTeam } = await import(
        "../../server/middleware/require-admin"
      );
      getCurrentUserMock.mockReturnValue({ id: "u2", email: "outsider@example.com" });

      const req = { session: {} } as unknown as Request;
      const res = makeRes();
      const next = vi.fn();

      await requireMasterAdminOrTeam(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next() when user is a master admin (no partner session)", async () => {
      const { requireMasterAdminOrTeam } = await import(
        "../../server/middleware/require-admin"
      );
      getCurrentUserMock.mockReturnValue({ id: "u3", email: "admin@example.com" });

      const req = { session: {} } as unknown as Request;
      const res = makeRes();
      const next = vi.fn();

      await requireMasterAdminOrTeam(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
