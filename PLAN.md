# PhotonicTag — Stage 2 Plan

**Date:** 2026-04-16  
**Prerequisite:** AUDIT.md reviewed and Stage 2 approved by user.  
**Ground rules:** PRs are ordered by blast radius (smallest, most reversible first). No PR starts until the previous one is merged and CI passes. Stage 3 (execution) requires explicit approval of this document.

---

## 1. Ordered PR List

PRs are sequenced so each one is independently deployable without breaking the one before it. Database migrations are backward-compatible (additive only — no column drops until a follow-up PR removes the application code that depends on them).

### PR-01 — Secrets hygiene (no downtime, no migration)
**Fixes:** D1, B7  
**What:** Remove hardcoded admin email and legacy deployment env references from application code.
- Move `MASTER_ADMIN_EMAILS` from `shared/models/auth.ts:17` to `MASTER_ADMIN_EMAILS` env var, parsed at startup. Fail fast if not set.
- Ensure SAP / email deep links use `APP_BASE_URL` (see `server/services/email.ts`).
- Document `APP_BASE_URL` in `.env.example` and Fly secrets.
- **Test:** Unit test that startup throws if `MASTER_ADMIN_EMAILS` is empty.

### PR-02 — Auth export endpoints (no migration)
**Fixes:** D4  
**What:** Add `isAuthenticated` (or team auth) to both export routes.
- `GET /api/export/presentation.pptx` → add `isAuthenticated` middleware.
- `POST /api/export/proposal.docx` → add `isAuthenticated` middleware.
- Wire export router through the same auth import used in `server/routes.ts`.
- **Test:** E2E test: unauthenticated GET returns 401.

### PR-03 — tenantId in Drizzle schema + migration
**Fixes:** C1  
**What:** Add `tenantId` column to all core tables in Drizzle schema, generate migration, and align with the existing SQL RLS file.
- Add `tenantId: text("tenant_id").notNull().default("default")` to: `products`, `auditLogs`, `partners`, `scans`, `enterpriseConnectors`, `dppAiInsights`, `productCategories`, `bookings`, `leads`, `customerAccounts`, `demoInstances`, `nextBestActions`.
- Run `drizzle-kit generate` to produce the migration.
- The generated migration supersedes `scripts/migrations/001_rls_tenant_isolation.sql` for the `ALTER TABLE` parts; keep the RLS `POLICY` statements from that file and append them after the Drizzle migration in a single combined migration file.
- Add `dataResidencyRegion: text("data_residency_region").notNull().default("eu-west-1")` to the `tenants` table.
- **Test:** Drizzle schema compiles; migration applies cleanly on a fresh DB.

### PR-04 — Wire TenantStorage into all routes
**Fixes:** C2, C3, C4  
**What:** Replace raw `storage.*()` calls with tenant-scoped calls in all authenticated routes.
- In `server/routes.ts`: replace `storage.getProduct(id)` etc. with `tenantStorage(req).getProduct(id)` for all authenticated endpoints. Public (scan) endpoints stay on global `storage`.
- In `server/routes/internal-routes.ts`: add tenant scoping to all CRM endpoints (accounts, leads, health scores, actions).
- In `server/routes/product-import-routes.ts`: already uses `storage` — replace with `tenantStorage(req)`.
- `tenantStorage(req)` factory in `server/storage-tenant.ts` already exists; extend it with the missing methods (leads, accounts, demos, connectors) as needed.
- **Test:** Unit test: two tenants cannot read each other's products even if they know the product ID.

### PR-05 — WorkOS provider: implement minimum viable SSO
**Fixes:** D3  
**What:** Replace the throw stub with a minimal WorkOS OIDC implementation so `AUTH_PROVIDER=workos` doesn't crash.
- Install `@workos-inc/node`.
- Implement `setup()`: register `/api/auth/workos/login`, `/api/auth/workos/callback` using WorkOS OAuth2 PKCE flow.
- `getCurrentUser()`: extract org from WorkOS session, look up `tenants` table by `ssoOrganizationId`, set `tenantId`.
- SCIM provisioning endpoint (`POST /api/webhooks/workos/scim`) — stub that returns 200 (defer actual user sync to a later PR).
- **Test:** Unit test that `setup()` does not throw when `WORKOS_CLIENT_ID` + `WORKOS_CLIENT_SECRET` are set.

### PR-06 — SAP credential encryption
**Fixes:** B6  
**What:** Encrypt SAP credentials at rest using AES-256-GCM before writing to `enterpriseConnectors.config` JSONB.
- Add `server/services/crypto-service.ts`: `encrypt(plaintext: string, key: Buffer): string` / `decrypt(ciphertext: string, key: Buffer): string` using Node `crypto.createCipheriv("aes-256-gcm", ...)`. Key from `CONNECTOR_ENCRYPTION_KEY` env var (must be 32-byte hex).
- In `server/services/sap-odata-client.ts`: decrypt `config.password` and `config.oauthClientSecret` immediately before use.
- In the route that writes connector config: encrypt before storing.
- Write a one-time migration script (`scripts/encrypt-existing-connectors.ts`) that re-encrypts any plaintext credentials already in the DB.
- **Test:** Round-trip unit test: encrypt → store → retrieve → decrypt → matches original.

### PR-07 — CRM AI pipeline hardening
**Fixes:** E1, E2, E3  
**What:** Apply the same Zod + confidence + eval pattern from DPP pipeline to CRM AI endpoints.
- Define `HealthScoreOutputSchema` and `ActionsOutputSchema` in `server/services/ai-eval-harness.ts` (or a new `server/services/crm-ai-schemas.ts`).
- Wrap all `JSON.parse(result)` calls in the CRM routes with schema validation; return 500 with structured error if validation fails.
- Add 3 golden cases for health scoring and 3 for next-best-action to the eval harness.
- Add CRM eval to `server/scripts/run-ai-eval.ts`.
- **Test:** Unit tests for new schemas; eval script covers CRM cases.

### PR-08 — EU AI routing (Azure OpenAI)
**Fixes:** B1, B2, E5  
**What:** Add EU-region AI endpoint support so product and CRM data doesn't leave the EU.
- Add `AI_ENDPOINT_REGION` env var (`"us"` | `"eu"`). Default: `"us"` (backwards compat).
- In `server/routes/internal-routes.ts:49-52`: construct OpenAI client with `baseURL` from env. EU → Azure OpenAI Sweden Central endpoint.
- In DPP enrichment pipeline: same.
- Document the Azure OpenAI setup in a new `docs/ai-eu-setup.md` (one page).
- **Test:** Unit test that EU region sets correct baseURL.

### PR-09 — Auth provider: WorkOS-only operations
**Fixes:** B3 (ongoing — WorkOS region/DPA)  
**Depends on:** PR-05 merged and WorkOS credentials configured in env  
**What:** Treat `AUTH_PROVIDER=workos` as the supported path in staging/production (Fly `fly secrets`, `fly.toml`).
- Remove any remaining references to obsolete hosted-dev auth or dev-only env vars in docs and CI.
- Confirm local and CI use the same WorkOS graceful-degradation behavior when `WORKOS_*` is unset.

### PR-10 — Email provider: EU-hosted relay
**Fixes:** B4  
**What:** Replace ProtonMail SMTP config with an EU-hosted transactional email provider (Mailjet EU, Brevo/Sendinblue FR, or AWS SES eu-west-1).
- Add `EMAIL_PROVIDER` env var: `"smtp"` (current) | `"mailjet"` | `"ses-eu"`.
- Wrap `server/services/email.ts` in a provider interface so SMTP internals are swappable without touching call sites.
- Update deployment secrets / `.env` to use the chosen EU provider's SMTP endpoint.
- Remove hardcoded `CET_TZ` — replace with `EMAIL_TIMEZONE` env var, default `"UTC"`.

### PR-11 — Database regional routing stub
**Fixes:** B5 (partial)  
**What:** Add the infrastructure plumbing for per-tenant DB routing. Does not migrate data — only adds the switchboard.
- Add `DB_REGION_MAP` env var: JSON mapping `{ "eu-west-1": "postgres://...", "us-east-1": "postgres://..." }`.
- In `server/db.ts`: export `getDbForRegion(region: string): DrizzleClient` that returns the right pool.
- In `TenantStorage`: look up tenant's `dataResidencyRegion`, call `getDbForRegion(region)` for all queries.
- If `DB_REGION_MAP` is not set, fall back to current single-URL behavior.
- **Test:** Unit test that `getDbForRegion` returns correct pool for each key.

---

## 2. Cell-Based Regional Deployment Topology

The target architecture after all PRs are merged:

```
                          ┌──────────────────────────────┐
                          │        Control Plane          │
                          │  (single global region)       │
                          │                               │
                          │  - Tenant registry            │
                          │  - SSO / WorkOS               │
                          │  - Billing                    │
                          │  - Audit log aggregation      │
                          │  - CI/CD                      │
                          └────────────┬─────────────────┘
                                       │ tenant→region lookup
                  ┌────────────────────┼───────────────────────┐
                  │                    │                         │
          ┌───────▼──────┐    ┌────────▼──────┐       ┌─────────▼──────┐
          │  EU Cell      │    │  US Cell      │       │  APAC Cell [?] │
          │ (eu-west-1)   │    │ (us-east-1)   │       │                │
          │               │    │               │       │                │
          │ - App pods    │    │ - App pods    │       │ ...            │
          │ - Postgres    │    │ - Postgres    │       │                │
          │ - Redis       │    │ - Redis       │       │                │
          │ - Azure OAI   │    │ - OpenAI US   │       │                │
          │   (EU region) │    │               │       │                │
          └───────────────┘    └───────────────┘       └────────────────┘
```

**Request flow:**
1. Client hits global load balancer (Cloudflare or AWS Global Accelerator).
2. Load balancer reads tenant JWT claim → looks up `tenants.dataResidencyRegion` (cached in Redis control plane).
3. Request routed to the cell matching that region.
4. **All data — DB, Redis, AI API — stays inside that cell's region.**

**SAP sync in cell model:**
- Each cell runs its own SAP sync worker.
- Distributed lock on Redis within the cell prevents duplicate syncs.
- Cross-cell SAP sync is not needed — customer's SAP is in one region.

**Replication policy:**
- Audit logs replicate from data cells → control plane for global compliance reporting.
- Product master data does NOT replicate across cells (sovereignty).
- Tenant registry replicates globally (read-heavy, no PII).

---

## 3. Data Classification Taxonomy + Provenance Column Design

### Classification Levels

| Level | Label | Examples | Retention | Residency |
|-------|-------|----------|-----------|-----------|
| L0 | Public | QR scan product view, DPP public fields | Indefinite | Any region |
| L1 | Internal | Audit logs, product change history | 7 years (ESPR) | Tenant region |
| L2 | Confidential | Consumer scan PII (email if captured), SAP credentials | 3 years | Tenant region, encrypted at rest |
| L3 | Restricted | Auth tokens, session data, HMAC keys | Session lifetime | Tenant region, never logged |

### Provenance Column Design (current + proposed)

**Existing (already in schema):**
- `auditLogs.chainHash` — HMAC-SHA256 over previous entry
- `auditLogs.dataSource` — `"human" | "sap_sync" | "ai_accepted" | "system"`
- `products.fieldProvenance` — JSONB: `{ [field]: { source, timestamp, confidence, runId } }`

**Proposed additions:**
- `products.dataClassification: text` — `"L0" | "L1" | "L2"`, set on create, immutable  
- `auditLogs.dataClassification: text` — inherited from product at write time  
- `tenants.dataResidencyRegion: text` — already proposed in PR-03  
- `tenants.allowedAiRegions: text[]` — list of permitted AI endpoint regions for this tenant (e.g., `["eu"]` for EU-only customers)  
- `enterpriseConnectors.credentialsCiphertext: text` — encrypted blob replacing plaintext fields (PR-06)

### Provenance rule for AI fields

When a product field is set by AI:
```json
{
  "carbonFootprint": {
    "source": "ai_accepted",
    "aiModel": "gpt-4o",
    "aiRegion": "eu-west",
    "confidence": 0.87,
    "runId": "uuid",
    "timestamp": "ISO8601",
    "humanReviewedAt": null
  }
}
```
`humanReviewedAt` is set when a producer explicitly confirms the AI suggestion. Required for eIDAS qualified timestamps on regulated fields.

---

## 4. Tenant Isolation Strategy

### Layer 1: Application (Drizzle middleware) — PR-04
Every authenticated query goes through `TenantStorage(tenantId)`. The `tenantId` is extracted from the JWT/session by `injectTenantId` middleware and stored on `req.tenantId`. No route handler is allowed to call `storage.*()` directly — only `tenantStorage(req).*()`.

Enforcement mechanism: ESLint rule (custom plugin, one file) that errors on `storage.` imports in route files. Cheap to add, impossible to accidentally bypass.

### Layer 2: Database (Postgres RLS) — PR-03
Every connection sets `SET LOCAL app.current_tenant_id = '<tenantId>'` before executing queries. The RLS policy `tenant_isolation` on each table checks `tenant_id = app_tenant_id()`. This is the **defense in depth** layer — even if application code is wrong, the DB refuses the cross-tenant read.

The `SET LOCAL` call goes into a Drizzle `beforeQuery` hook in `server/db.ts`:
```typescript
db.$client.on('connect', client => {
  // set at session level as fallback
});
// Per-query: wrap in transaction with SET LOCAL
```

Implementation: transaction wrapper in `TenantStorage` that runs `SET LOCAL app.current_tenant_id = $1` before every query.

### Layer 3: API (middleware) — already done
`requireTenantId(req)` throws 401 if no tenant is present. Already implemented in `server/middleware/tenant.ts`.

### What stays global (no tenant scoping)
- Public scan endpoints (`GET /api/products/:id`) — tenantId is irrelevant for public reads
- Control plane routes (tenant registry CRUD) — these are pre-auth
- Audit log aggregation (read-only, admin-only)

### Data isolation for demo instances
Demo instances (created by `POST /api/internal/demos/provision`) are scoped to a synthetic `tenant_id = "demo_<instanceId>"`. This prevents demo data from leaking into real tenant storage.

---

## 5. Subprocessor Replacement Table

| Current Subprocessor | Data Sent | Risk | Proposed Replacement | Notes |
|---------------------|-----------|------|---------------------|-------|
| OpenAI US (`api.openai.com`) | DPP product data + CRM PII | CRITICAL | Azure OpenAI (Sweden Central or France Central) | Same GPT-4o model; requires Azure subscription + DPA with Microsoft. EU data boundary guarantee available. See PR-08. |
| Legacy hosted-dev OIDC (removed) | — | — | WorkOS (SSO/SAML 2.0) | WorkOS has EU data residency option on appropriate plans. See PR-05, PR-09. |
| ProtonMail SMTP (`smtp.protonmail.ch`) | Consumer PII, booking data | MEDIUM | Brevo (formerly Sendinblue, FR) or Mailjet (FR) | Both are French companies, EU-hosted, GDPR DPA available. See PR-10. |
| Postgres (region of `DATABASE_URL`) | All data | HIGH | Postgres on EU cloud (AWS RDS eu-west-1 or Render EU) | DB_REGION_MAP in PR-11 enables this without code changes. |
| Redis (unknown) | Sessions, events | ? | Redis on same cloud + region as Postgres | Must be co-located with cell DB. |

### Subprocessors that stay
| Subprocessor | Why it stays | Residency action |
|-------------|-------------|-----------------|
| SAP S/4HANA | Customer-controlled; PhotonicTag only reads, doesn't store PII | None — customer controls their own SAP |
| pptxgenjs, docx | Local libraries, no external call | None |

---

## Approval Checklist

Before Stage 3 begins, confirm:

- [ ] AUDIT.md findings reviewed and understood
- [ ] PLAN.md PR order approved
- [ ] PR-01 to PR-11 scope approved (or specific PRs descoped)
- [ ] Azure OpenAI EU subscription available (needed for PR-08)
- [ ] WorkOS account and credentials available (needed for PR-05)
- [ ] EU Postgres target confirmed (needed for PR-11)
- [ ] `CONNECTOR_ENCRYPTION_KEY` provisioned (needed for PR-06)
- [ ] Stage 3 explicitly approved: "Proceed with Stage 3"
