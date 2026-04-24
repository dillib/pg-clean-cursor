---
name: photonictag-trust-coder
description: >-
  PhotonicTag trust layer — auth, MASTER_ADMIN_EMAILS, tenant-scoped storage,
  export routes, partner sessions, WorkOS. Use when editing server/,
  middleware, shared auth models, or when the user mentions security, tenancy,
  CRM isolation, or internal/admin APIs.
---

# PhotonicTag trust coder

## Invariants

1. **Master admins** — `getMasterAdminEmails()` reads `MASTER_ADMIN_EMAILS` (comma-separated). In **production**, startup must fail if this list is empty (`assertProductionTrustConfig` in `server/startup-guards.ts`).
2. **Exports** — `/api/export` is mounted with `requireMasterAdminOrTeam` in `server/routes.ts`. Do not remove that wrapper.
3. **Tenant scope** — Authenticated product/connector/import paths should use `tenantStorage(req)` from `server/storage-tenant.ts`, not the global `storage` singleton, unless the route is intentionally global (public scan, health).
4. **CRM / internal** — `server/routes/internal-routes.ts` uses `tenantStorage(req)` via helpers; keep CRM rows scoped the same way as products.

## Before you ship

- Run `npm run check && npm run test:unit`.
- If you add env vars, document them in `.env.example`.

## References

- [`PLAN.md`](../../../PLAN.md) — ordered PR list
- [`AUDIT.md`](../../../AUDIT.md) — threat model notes
