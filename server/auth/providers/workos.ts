/**
 * WorkOS SSO provider — AuthKit-hosted login.
 *
 * Env:
 *   WORKOS_API_KEY        server-side API key (sk_live_... / sk_test_...)
 *   WORKOS_CLIENT_ID      AuthKit client id (client_...)
 *   WORKOS_REDIRECT_URI   must match the redirect configured in WorkOS dashboard
 *
 * Routes registered (match the frontend's existing /api/login + /api/logout):
 *   GET  /api/login              → redirect to AuthKit hosted login
 *   GET  /api/callback           → exchange ?code= for user + session
 *   GET  /api/logout             → destroy session
 *   GET  /api/auth/workos/login      alias of /api/login
 *   GET  /api/auth/workos/callback   alias of /api/callback
 *   POST /api/webhooks/workos/scim   200 stub (replace when SCIM is wired)
 *
 * Tenant mapping: session.tenantId = workos.organizationId ?? user.id
 * (single-user fallback for users not yet linked to a WorkOS organization).
 */
import { WorkOS } from "@workos-inc/node";
import type { Express, Request, RequestHandler, Response } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { RedisStore } from "connect-redis";
import { getRedisClient } from "../../redis";
import { authStorage } from "../../integrations/auth/storage";
import { isMasterAdminEmail } from "@shared/models/auth";
import type { AuthProvider, AuthenticatedUser } from "../types";

const REQUIRED_ENV = ["WORKOS_API_KEY", "WORKOS_CLIENT_ID", "WORKOS_REDIRECT_URI"] as const;

function isConfigured(): boolean {
  return REQUIRED_ENV.every((k) => !!process.env[k]);
}

function missingEnvList(): string[] {
  return REQUIRED_ENV.filter((k) => !process.env[k]);
}

function buildSessionMiddleware() {
  const ttlSec = 7 * 24 * 60 * 60;
  const redis = getRedisClient();
  const store = redis
    ? new RedisStore({ client: redis, ttl: ttlSec, prefix: "sess:" })
    : (() => {
        const PgStore = connectPg(session);
        return new PgStore({
          conString: process.env.DATABASE_URL,
          createTableIfMissing: false,
          ttl: ttlSec,
          tableName: "sessions",
        });
      })();

  console.log(
    `[Session] Using ${redis ? "Redis" : "Postgres"} session store (workos provider)`
  );

  return session({
    secret: process.env.SESSION_SECRET!,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ttlSec * 1000,
    },
  });
}

type SessionUser = {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  tenantId: string;
  organizationId?: string;
};

function writeSession(req: Request, u: SessionUser) {
  const s = req.session as any;
  s.userId = u.userId;
  s.email = u.email;
  s.firstName = u.firstName;
  s.lastName = u.lastName;
  s.isAdmin = u.isAdmin;
  s.tenantId = u.tenantId;
  s.organizationId = u.organizationId;
}

class WorkOSAuthProvider implements AuthProvider {
  private workos: WorkOS | null = null;

  async setup(app: Express): Promise<void> {
    app.set("trust proxy", 1);
    app.use(buildSessionMiddleware());

    if (!isConfigured()) {
      console.warn(
        `[auth/workos] AUTH_PROVIDER=workos but missing env: ${missingEnvList().join(", ")}. ` +
          `SSO endpoints will return 503 until these are set.`
      );
    } else {
      this.workos = new WorkOS(process.env.WORKOS_API_KEY!);
    }

    const clientId = process.env.WORKOS_CLIENT_ID!;
    const redirectUri = process.env.WORKOS_REDIRECT_URI!;

    const login = (req: Request, res: Response) => {
      if (!this.workos) {
        return res.status(503).json({
          error: "WorkOS not configured",
          missingEnv: missingEnvList(),
        });
      }
      const returnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : "/";
      (req.session as any).returnTo = returnTo;

      const url = this.workos.userManagement.getAuthorizationUrl({
        clientId,
        redirectUri,
        provider: "authkit",
      });
      res.redirect(url);
    };

    const callback = async (req: Request, res: Response) => {
      if (!this.workos) {
        return res.status(503).json({
          error: "WorkOS not configured",
          missingEnv: missingEnvList(),
        });
      }
      const code = typeof req.query.code === "string" ? req.query.code : "";
      if (!code) {
        return res.status(400).json({ error: "Missing ?code parameter" });
      }
      try {
        const { user, organizationId } = await this.workos.userManagement.authenticateWithCode({
          clientId,
          code,
        });

        const email = user.email ?? "";
        const isAdmin = isMasterAdminEmail(email);

        await authStorage.upsertUser({
          id: user.id,
          email,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          profileImageUrl: user.profilePictureUrl ?? undefined,
        });

        writeSession(req, {
          userId: user.id,
          email,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          isAdmin,
          tenantId: organizationId ?? user.id,
          organizationId,
        });

        const returnTo = (req.session as any)?.returnTo ?? "/";
        delete (req.session as any)?.returnTo;
        res.redirect(returnTo);
      } catch (err) {
        console.error("[auth/workos] authenticateWithCode failed", err);
        res.status(401).json({ error: "Authentication failed" });
      }
    };

    const logout = (req: Request, res: Response) => {
      req.session.destroy((err) => {
        if (err) console.error("[auth/workos] session destroy failed", err);
        res.redirect("/");
      });
    };

    app.get("/api/login", login);
    app.get("/api/callback", callback);
    app.get("/api/logout", logout);
    app.get("/api/auth/workos/login", login);
    app.get("/api/auth/workos/callback", callback);

    app.post("/api/webhooks/workos/scim", (_req: Request, res: Response) => {
      res.status(200).json({ received: true, processed: false });
    });
  }

  isAuthenticated: RequestHandler = (req, res, next) => {
    const userId = (req.session as any)?.userId;
    if (userId) return next();
    return res.status(401).json({ message: "Unauthorized" });
  };

  getCurrentUser(req: Request): AuthenticatedUser | null {
    const s = req.session as any;
    if (!s?.userId) return null;
    return {
      id: s.userId,
      email: s.email ?? "",
      firstName: s.firstName,
      lastName: s.lastName,
      isAdmin: s.isAdmin === true,
      tenantId: s.tenantId ?? s.userId,
      organizationId: s.organizationId,
    };
  }
}

export const workosProvider = new WorkOSAuthProvider();
