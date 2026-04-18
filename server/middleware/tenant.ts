/**
 * Tenant context middleware.
 *
 * Extracts tenantId from the authenticated user and attaches it to the request.
 * All storage calls downstream should call `getTenantId(req)` instead of
 * reaching into req.user directly.
 *
 * Partner sessions and public endpoints use explicit product IDs, so tenant
 * scoping for those is enforced at the storage layer via productId ownership.
 */
import type { Request, RequestHandler } from "express";
import { authProvider } from "../auth";

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export const injectTenantId: RequestHandler = (req, _res, next) => {
  const user = authProvider.getCurrentUser(req);
  if (user) {
    req.tenantId = user.tenantId;
  }
  next();
};

/**
 * Returns the tenant ID from the request. Throws if called on an unauthenticated
 * request without a fallback — use this in route handlers after isAuthenticated.
 */
export function requireTenantId(req: Request): string {
  if (req.tenantId) return req.tenantId;
  // Partner sessions: tenantId will be added when partners are linked to tenants.
  // For now, use partnerId as tenant scope for partner sessions.
  const partnerId = (req.session as any)?.partnerId;
  if (partnerId) return `partner:${partnerId}`;
  throw new Error("No tenant context on request — isAuthenticated must run first.");
}

/**
 * Returns the tenant ID if present, undefined otherwise (for public endpoints).
 */
export function getTenantId(req: Request): string | undefined {
  return req.tenantId ?? undefined;
}
