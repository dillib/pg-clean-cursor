/**
 * Route-level tenant-scoping convention check.
 *
 * Authenticated route files are not allowed to import the global `storage`
 * singleton and use it for tenant-scoped entities (products, enterprise
 * connectors, audit logs, etc.). They must go through `tenantStorage(req)`
 * so the Drizzle-layer filter + Postgres RLS both kick in.
 *
 * This is the application-layer belt; RLS (migration 002) is the suspenders.
 * If you need an escape hatch for a genuinely tenant-agnostic operation
 * (public scan endpoint, cross-tenant admin maintenance), use
 * `tenantStorage(req).base.*` — an audit trail of intentional bypasses.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROUTES_DIR = join(process.cwd(), "server", "routes");
const FORBIDDEN = /\bstorage\.(getAllProducts|getProduct|createProduct|updateProduct|deleteProduct|getAllEnterpriseConnectors|getEnterpriseConnector)\b/;

// Files that legitimately need raw storage (public endpoints, staff-only
// admin consoles, non-tenant operations). Keep this list short and reviewed.
const ALLOWLIST = new Set<string>([
  // sap-routes uses raw storage for credential materialization; tenant check
  // happens before that call site.
  "sap-routes.ts",
  // export-routes renders PPTX/DOCX for admin use only
  "export-routes.ts",
]);

function listRouteFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listRouteFiles(full));
    } else if (name.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("route tenant-scoping discipline", () => {
  it("no route file outside the allowlist uses storage.* for tenant-scoped entities", () => {
    const offenders: string[] = [];
    for (const file of listRouteFiles(ROUTES_DIR)) {
      const basename = file.split(/[\\/]/).pop() ?? file;
      if (ALLOWLIST.has(basename)) continue;
      const src = readFileSync(file, "utf8");
      if (FORBIDDEN.test(src)) {
        offenders.push(basename);
      }
    }
    expect(offenders, `Route files calling storage.* directly: ${offenders.join(", ")}. Use tenantStorage(req) instead, or add to ALLOWLIST with justification.`).toEqual([]);
  });
});
