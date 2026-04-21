import type { Express, Request, RequestHandler } from "express";

/**
 * Standardized user identity — provider-agnostic.
 * WorkOS/Okta will populate organizationId; single-tenant setups may use user id as tenantId.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  tenantId: string;         // WorkOS org ID or single-tenant fallback
  organizationId?: string;  // WorkOS / Okta org — undefined until SSO is wired
  roles?: string[];
}

/**
 * Swappable auth provider interface.
 * Implement this to swap WorkOS → Okta (etc.) without touching routes.
 */
export interface AuthProvider {
  /** Register session middleware, passport strategies, OIDC discovery etc. */
  setup(app: Express): Promise<void>;

  /** Express middleware — 401 if not authenticated, calls next() if ok */
  isAuthenticated: RequestHandler;

  /** Extract the current user from a request; null if unauthenticated */
  getCurrentUser(req: Request): AuthenticatedUser | null;
}
