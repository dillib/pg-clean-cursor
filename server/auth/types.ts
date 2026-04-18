import type { Express, Request, RequestHandler } from "express";

/**
 * Standardized user identity — provider-agnostic.
 * WorkOS/Okta will populate organizationId; Replit uses userId as tenantId for now.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  tenantId: string;         // WorkOS org ID | Replit user ID (single-tenant fallback)
  organizationId?: string;  // WorkOS / Okta org — undefined until SSO is wired
  roles?: string[];
}

/**
 * Swappable auth provider interface.
 * Implement this to swap Replit → WorkOS → Okta without touching routes.
 */
export interface AuthProvider {
  /** Register session middleware, passport strategies, OIDC discovery etc. */
  setup(app: Express): Promise<void>;

  /** Express middleware — 401 if not authenticated, calls next() if ok */
  isAuthenticated: RequestHandler;

  /** Extract the current user from a request; null if unauthenticated */
  getCurrentUser(req: Request): AuthenticatedUser | null;
}
