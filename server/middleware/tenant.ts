/**
 * Tenant context middleware.
 *
 * Extracts tenantId from the authenticated user and attaches it to the request.
 * All storage calls downstream should call `getTenantId(req)` instead of
 * reaching into req.user directly.
 *
 * Partner sessions use `getTenantId` → `partner:<id>` so CRM and products stay
 * isolated the same way as WorkOS org tenants.
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
 * Returns the tenant ID if present, undefined otherwise (for public endpoints).
 */
export function getTenantId(req: Request): string | undefined {
  if (req.tenantId) return req.tenantId;
  const partnerId = (req.session as { partnerId?: string } | undefined)?.partnerId;
  if (partnerId) return `partner:${partnerId}`;
  return undefined;
}

/**
 * Returns the tenant ID from the request. Throws if called on an unauthenticated
 * request without a fallback — use this in route handlers after isAuthenticated.
 */
export function requireTenantId(req: Request): string {
  const t = getTenantId(req);
  if (t) return t;
  throw new Error("No tenant context on request — isAuthenticated must run first.");
}
