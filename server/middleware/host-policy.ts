/**
 * Host policy — route-prefix gate for the three-system separation.
 *
 * Context (see architecture notes): one codebase runs three logical apps —
 *   - marketing + customer tenant product  (customer host)
 *   - internal ops / sales / demo console  (ops host)
 *
 * Today both ship from the same Fly app; tomorrow they'll ship from two Fly
 * apps with different DNS. This middleware lets us flip the boundary via env
 * vars without a code change:
 *
 *   HOST_MODE=customer  → block any request whose path belongs to the ops app
 *   HOST_MODE=ops       → block any request whose path belongs to the tenant app
 *   HOST_MODE=any       → allow everything (default; dev, preview, fly.dev)
 *
 * Or, when one Fly app serves both domains, set:
 *   APP_HOSTS=app.photonictag.com,www.photonictag.com
 *   OPS_HOSTS=ops.photonictag.com
 * and the mode is derived from req.hostname.
 *
 * Unknown hosts fall back to "any" so local dev (localhost, *.fly.dev) and
 * preview deploys continue to work unchanged.
 *
 * Blocked paths return 404 (not 403) — do not leak that the route exists on
 * the other host.
 */
import type { Request, Response, NextFunction } from "express";

export type HostMode = "customer" | "ops" | "any";

// Path prefixes that belong to the ops/internal console. Matches both SPA
// routes (e.g. /internal/login) and API endpoints under the same prefix
// (e.g. /api/internal/...). Add new ops features under one of these roots
// so they inherit the gate automatically.
const OPS_PATH_PREFIXES = [
  "/internal",
  "/team",
  "/demo",
  "/partner",
  "/admin",
  "/api/leads",
  "/api/partners",
  "/api/demo-configs",
  "/api/demo-bookings",
  "/api/internal",
  "/api/export",
  "/api/admin",
] as const;

// Path prefixes that belong to the tenant customer app. Marketing and public
// scan pages live outside this list — they stay reachable on either host so
// marketing links work everywhere.
const TENANT_ONLY_PATH_PREFIXES = [
  "/products",
  "/iot-devices",
  "/integrations/sap",
  "/crm",
] as const;

// Never gate these — infrastructure paths must answer on both hosts.
const ALWAYS_ALLOW_PREFIXES = [
  "/healthz",
  "/assets/",
  "/api/webhooks/",
] as const;

function parseHosts(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

export function getHostMode(req: Request): HostMode {
  const explicit = process.env.HOST_MODE?.toLowerCase();
  if (explicit === "customer" || explicit === "ops" || explicit === "any") {
    return explicit;
  }

  const host = req.hostname.toLowerCase();
  const opsHosts = parseHosts(process.env.OPS_HOSTS);
  const appHosts = parseHosts(process.env.APP_HOSTS);

  if (opsHosts.includes(host)) return "ops";
  if (appHosts.includes(host)) return "customer";
  return "any";
}

function matchesPrefix(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(p.endsWith("/") ? p : p + "/"));
}

export function hostPolicyMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const mode = getHostMode(req);
    if (mode === "any") return next();

    const path = req.path;

    if (matchesPrefix(path, ALWAYS_ALLOW_PREFIXES)) return next();

    if (mode === "customer" && matchesPrefix(path, OPS_PATH_PREFIXES)) {
      return res.status(404).send("Not Found");
    }

    if (mode === "ops" && matchesPrefix(path, TENANT_ONLY_PATH_PREFIXES)) {
      return res.status(404).send("Not Found");
    }

    next();
  };
}
