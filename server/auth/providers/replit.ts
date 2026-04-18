/**
 * Replit OIDC auth provider — wraps the existing replitAuth.ts wiring
 * behind the AuthProvider interface so it is swappable.
 */
import type { Express, Request, RequestHandler } from "express";
import type { AuthProvider, AuthenticatedUser } from "../types";
import {
  setupAuth as replitSetupAuth,
  isAuthenticated as replitIsAuthenticated,
  getSession,
} from "../../replit_integrations/auth/replitAuth";
import { authStorage } from "../../replit_integrations/auth/storage";
import { isMasterAdminEmail } from "@shared/models/auth";

class ReplitAuthProvider implements AuthProvider {
  async setup(app: Express): Promise<void> {
    await replitSetupAuth(app);
  }

  isAuthenticated: RequestHandler = replitIsAuthenticated;

  getCurrentUser(req: Request): AuthenticatedUser | null {
    const user = req.user as any;
    if (!user?.claims?.sub) return null;

    const email: string = user.claims.email ?? "";
    const isAdmin = isMasterAdminEmail(email);

    return {
      id: user.claims.sub,
      email,
      firstName: user.claims.first_name,
      lastName: user.claims.last_name,
      isAdmin,
      // Single-tenant fallback: each Replit user is their own tenant.
      // WorkOS will replace this with the org ID from the SSO assertion.
      tenantId: user.claims.sub,
    };
  }
}

export const replitProvider = new ReplitAuthProvider();
