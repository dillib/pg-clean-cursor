# PhotonicTag — Stage 1 Audit

**Date:** 2026-04-16  
**Scope:** Data residency, tenancy, auth, AI pipeline, subprocessors  
**Methodology:** Full source read of all routes, services, schema, config, and infrastructure files. Trust code over README / deployment docs. Uncertain items marked `[?]`.

---

## A. Data Flow Map

| Flow | Entry point | Path | Exit / Store |
|------|-------------|------|--------------|
| Consumer product scan | `GET /api/products/:id` (public) | Rate-limited (60/min) → `storage.getProduct()` | Postgres → JSON response |
| DPP QR scan uniqueness | `GET /api/scans` (public) | `storage.findProductScanBySession()` | Postgres |
| Producer auth | Browser → WorkOS AuthKit | Token exchange → session (Postgres or Redis) | Postgres `sessions` / Redis |
| Authenticated API | All `/api/*` routes | `isAuthenticated` → `injectTenantId` → route handler → `storage.*()` | Postgres |
| SAP sync | `setInterval` in `sap-odata-client.ts` | OData/OAuth2 → `SAPODataClient.fetchMaterials()` → `storage.createProduct()` | SAP S/4HANA → Postgres |
| DPP AI enrichment | `POST /api/products/import/analyze` | `aiLimiter` → OpenAI `gpt-4o` (US) → `validateAIOutput` → confidence thresholds | OpenAI US → Postgres (on confirm) |
| CRM AI health score | `POST /api/internal/accounts/:id/health-score` | `aiChat()` → OpenAI `gpt-4o` (US) → `JSON.parse()` | OpenAI US → Postgres `customerAccounts.healthScore` |
| CRM AI next-best-action | `POST /api/internal/accounts/:id/generate-actions` | `aiChat()` → OpenAI `gpt-4o` (US) → `JSON.parse()` | OpenAI US → Postgres `nextBestActions` |
| Demo provisioning | `POST /api/internal/demos/provision` | `aiChat()` multiple times → OpenAI `gpt-4o` (US) | OpenAI US → Postgres `demoInstances` |
| Transactional email | Various triggers | `nodemailer` → ProtonMail SMTP (CH) | Consumer PII → Switzerland relay |
| Export (marketing PPTX) | `GET /api/export/presentation.pptx` | **No auth** → in-memory pptxgen | Response stream (public) |
| Export (sales proposal) | `POST /api/export/proposal.docx` | **No auth** → in-memory docx | Response stream (public) |
| Audit chain | Every write | `AuditService` → HMAC-SHA256 chain | Postgres `auditLogs` |
| Events | Internal publish | Redis Streams → in-process fallback | Redis or memory |

---

## B. Residency Blockers

These are hard blockers for EU data residency compliance. File:line references point to the exact location.

### B1 — OpenAI US API: DPP product data
**File:** `server/routes.ts` (AI analyze endpoint), `server/routes/product-import-routes.ts`  
**Risk:** Every bulk import AI enrichment call sends product data (manufacturer, materials, sustainability fields, country of origin) to `api.openai.com` — a US-hosted endpoint. No Azure OpenAI EU region configured. No data processing agreement (DPA) reference anywhere in the codebase.  
**GDPR exposure:** Art. 44 — cross-border transfer without SCCs or adequacy decision for product data that may include trade secrets.

### B2 — OpenAI US API: CRM customer PII
**File:** `server/routes/internal-routes.ts:49-52` (OpenAI client instantiation), lines ~282, ~324, ~458, ~566 (`aiChat()` calls)  
**Risk:** Customer company names, health scores, MRR, activity logs, and support ticket counts are sent verbatim to OpenAI US API for health scoring and next-best-action generation. This is **customer PII / commercially sensitive data** flowing to a US subprocessor with no EU endpoint option configured.  
**GDPR exposure:** Art. 44, potentially Art. 9 if health/financial data is involved. Likely violates enterprise customer DPA terms.

### B3 — WorkOS AuthKit: auth tokens (region per WorkOS config)
**File:** `server/auth/providers/workos.ts`, `server/auth/index.ts`  
**Risk:** User identities (email, name, profile) flow through WorkOS on every session creation. Subprocessor region and DPA depend on your WorkOS project settings (EU residency is available on appropriate plans). *(Prior third-party hosted OIDC paths were removed; auth is WorkOS-only in this tree.)*

### B4 — ProtonMail SMTP: consumer PII via Switzerland
**File:** Deployment env (`SMTP_HOST`, etc. — e.g. Fly secrets, `.env`) and `server/services/email.ts` — `sendBookingConfirmation()`, `sendReminderEmail()`  
**Risk:** Consumer booking PII (name, email, company, interest area) and producer team notifications transit the configured SMTP relay. If that relay is ProtonMail (CH), Switzerland has an EU adequacy decision (Art. 45), but it remains a third-country transfer and must be disclosed in privacy notices. Prefer explicit deployment-time secrets over hardcoded hosts.

### B5 — Single DATABASE_URL: no regional routing
**File:** `drizzle.config.ts:4`, `server/db.ts`  
**Risk:** One `DATABASE_URL` controls all data. No read replica routing, no regional write endpoint selection, no per-tenant DB routing. Cell-based deployment (a future requirement) is architecturally impossible without this being reworked. All data is wherever this single URL points (hosting region is deployment-specific).

### B6 — SAP credentials stored plaintext in DB
**File:** `shared/schema.ts` — `enterpriseConnectors.config` JSONB column holds `SAPConfig` including `password` and `oauthClientSecret`  
**File:** `server/services/sap-odata-client.ts` — reads `config.password`, `config.oauthClientSecret` directly  
**Risk:** SAP integration credentials stored unencrypted in the database. Any Postgres dump, log leak, or compromised replica exposes SAP system credentials. This is an Art. 32 GDPR technical measure failure and likely violates enterprise customer security requirements.

### B7 — ~~Dev-host env coupling~~ *(resolved in repo cleanup)*
**Was:** Vendor-specific public URL env vars and optional dev-only Vite telemetry plugins tied to a hosted IDE.  
**Now:** SAP alert links use `APP_BASE_URL` (see `server/services/email.ts`). `vite.config.ts` uses standard `@vitejs/plugin-react` only; vendor-specific Vite plugins removed.

### B8 — CET timezone hardcoded in email service
**File:** `server/services/email.ts:29` — `const CET_TZ = "Europe/Berlin"`  
**Risk:** Minor. Timezone is baked into transactional email formatting. This assumes all producers are in CET, which is wrong for UK, Turkey, or Nordic deployments. Not a GDPR blocker but a localization correctness issue.

---

## C. Tenancy Findings

### C1 — RLS migration exists but is NOT applied
**File:** `scripts/migrations/001_rls_tenant_isolation.sql`  
The SQL migration file adds `tenant_id` to 12 tables and enables Postgres RLS. **This migration has not been run against the database.** The Drizzle schema (`shared/schema.ts`) does NOT have `tenantId` columns on `products`, `auditLogs`, `partners`, `scans`, or any other core table. Drizzle-generated migrations would not include these columns. The SQL file exists but is unexecuted dead code.

### C2 — TenantStorage exists but is not used anywhere
**File:** `server/storage-tenant.ts`  
`TenantStorage` wraps storage calls with tenant scoping. **No route uses it.** All routes import and call the global `storage` singleton directly. Multi-tenancy in storage is not wired up.

### C3 — CRM has zero tenant scoping
**File:** `server/routes/internal-routes.ts`  
All CRM endpoints (accounts, leads, demos, health scores, next-best-actions) call `storage.*()` with no tenant filter. Every admin user sees every customer account across all tenants. If two enterprise customers ever share an instance, their CRM data would be cross-visible.

### C4 — injectTenantId middleware not plumbed into storage
**File:** `server/middleware/tenant.ts`, `server/routes.ts`  
`injectTenantId` sets `req.tenantId` from session. It's registered globally on Express. However, route handlers extract storage data without passing `req.tenantId` into any query. The middleware sets the value but nothing uses it downstream.

### C5 — tenants table lacks dataResidencyRegion
**File:** `shared/schema.ts` — `tenants` table  
The `tenants` table has `ssoOrganizationId` and `scimDirectoryId` but no `dataResidencyRegion` or `region` column. Cell-based deployment requires knowing which region each tenant belongs to at query time. This field must exist before regional routing can be implemented.

---

## D. Auth Findings

### D1 — Personal email hardcoded as master admin
**File:** `shared/models/auth.ts:17` — `MASTER_ADMIN_EMAILS = ["dillib@gmail.com"]`  
A personal Gmail address is hardcoded in production source code as the master admin. This is in the shared schema module, visible to anyone with repo access. Must be moved to an environment variable before any enterprise customer sees the codebase.

### D2 — partnerId session auth: no DB liveness check
**File:** `server/routes/internal-routes.ts:35-45` — `isAdminOrTeamUser` middleware  
The `partnerId` path grants admin access if `req.session.partnerId` is set — but doesn't verify the partner record still exists or is still active in the DB. A deleted or suspended partner with a live session would retain access.

### D3 — WorkOS provider crashes server on startup
**File:** `server/auth/providers/workos.ts` — `setup()` throws `"WorkOS not yet implemented"`  
Setting `AUTH_PROVIDER=workos` in any environment crashes Express before it binds to a port. The stub is incomplete. Enterprise SSO is not deployable today.

### D4 — Export endpoints are fully public (no auth)
**File:** `server/routes/export-routes.ts:16` — `GET /api/export/presentation.pptx`  
**File:** `server/routes/export-routes.ts:1037` — `POST /api/export/proposal.docx`  
Both export routes generate documents containing internal pricing, roadmap claims, competitive positioning, and customer-facing proposal content. Neither endpoint has any authentication middleware. Anyone with the URL can download them.

### D5 — Demo password stored plaintext [?]
**File:** `shared/schema.ts` — `demoConfigs.demoPassword` column (uncertain — not confirmed read)  
`[?]` Based on schema knowledge from prior session. If this column exists as plaintext, it must be hashed.

---

## E. AI Pipeline Findings

### E1 — Two independent OpenAI clients, inconsistent hardening
**File 1:** `server/routes/internal-routes.ts:49-52`  
**File 2:** `server/routes.ts` / `server/routes/product-import-routes.ts` (DPP enrichment)  

The DPP enrichment pipeline is properly hardened: Zod schema validation (`validateAIOutput`), per-field confidence thresholds (`enforceConfidenceThresholds`), provenance tagging, eval harness with 3 golden cases, 80% minimum accuracy gate in CI.

The internal CRM AI pipeline has **none of this**: no schema validation, no confidence thresholds, no eval coverage, no retry logic, no circuit breaker. Both pipelines use the same US-hosted OpenAI endpoint.

### E2 — Direct JSON.parse on AI output in CRM pipeline
**File:** `server/routes/internal-routes.ts:295, 338`  
`JSON.parse(result)` is called directly on OpenAI completion output with no error handling for malformed JSON, no schema validation, and no fallback. A malformed AI response will throw and return a 500. A valid-but-wrong-shape response will silently store garbage data to Postgres.

### E3 — Direct openai.chat.completions.create calls bypass aiChat()
**File:** `server/routes/internal-routes.ts:814, 848`  
Two endpoints call `openai.chat.completions.create()` directly instead of `aiChat()`, skipping even the minimal abstraction. No try/catch visible in the surrounding context read.

### E4 — AI eval covers DPP only; CRM AI unvalidated in CI
**File:** `server/scripts/run-ai-eval.ts`, `server/services/ai-eval-harness.ts`  
The eval harness and golden test suite cover only DPP bulk import enrichment. The CRM AI features (health scoring, next-best-action, demo provisioning) have no eval coverage. CI will pass regardless of CRM AI output quality.

### E5 — No Azure OpenAI EU endpoint option
All AI calls default to `api.openai.com` via the `baseURL` env var. There is no code path that routes to Azure OpenAI's EU regions (`swedencentral`, `francecentral`, `germanywestcentral`). Adding EU routing requires both an endpoint config and an API key swap — the current single-env-var design doesn't support per-region AI routing.

---

## F. Subprocessor Inventory

| # | Subprocessor | Region | Data Sent | Code Location | GDPR Risk |
|---|-------------|--------|-----------|---------------|-----------|
| F1 | OpenAI (`api.openai.com`) | US (California) | Product DPP data (materials, manufacturer, sustainability) + CRM PII (company, MRR, health scores) | `server/routes/internal-routes.ts:49`, `server/routes.ts` (AI analyze) | **HIGH** — Art. 44, no EU endpoint, no DPA reference in code |
| F2 | WorkOS AuthKit | Per WorkOS project | User identity tokens (email, name, profile) on auth | `server/auth/providers/workos.ts` | **HIGH/MEDIUM** — depends on WorkOS region + DPA; EU residency optional |
| F3 | ProtonMail SMTP (`smtp.protonmail.ch`) | Switzerland (CH) | Consumer PII: name, email, company, interest area, booking details | `server/services/email.ts`, SMTP env | **MEDIUM** — adequacy decision exists but is third-country transfer; must be disclosed |
| F4 | Postgres DB | Hosting region of `DATABASE_URL` | All product, consumer scan, audit, CRM data — everything | `server/db.ts`, `drizzle.config.ts` | **HIGH** — entire data estate follows that region; no regional routing in app |
| F5 | SAP S/4HANA | Customer-controlled | Material master data pulled to PhotonicTag DB | `server/services/sap-odata-client.ts` | **LOW** — customer controls their own SAP; PhotonicTag pulls, not pushes PII |
| F6 | Redis | Unknown `[?]` | Session data, event stream | `server/redis.ts` | **[?]** — risk depends on where `REDIS_URL` points; not yet configured in any env files seen |

---

## Summary Severity Table

| ID | Area | Severity | Description |
|----|------|----------|-------------|
| B1 | Residency | CRITICAL | OpenAI US: DPP product data |
| B2 | Residency | CRITICAL | OpenAI US: CRM customer PII |
| B3 | Residency | HIGH | WorkOS / identity provider region and DPA |
| B5 | Residency | HIGH | Single DATABASE_URL, no regional routing |
| B6 | Security | HIGH | SAP credentials plaintext in DB |
| D4 | Auth | HIGH | Export endpoints publicly accessible |
| C1 | Tenancy | HIGH | RLS migration unexecuted; tenantId not in Drizzle schema |
| C2 | Tenancy | HIGH | TenantStorage exists but not used in any route |
| D1 | Auth | HIGH | Personal Gmail hardcoded as master admin |
| D3 | Auth | HIGH | WorkOS stub crashes server on startup |
| E1 | AI | HIGH | CRM AI pipeline has no validation, no eval coverage |
| E2 | AI | MEDIUM | Direct JSON.parse on AI output, no error handling |
| C3 | Tenancy | MEDIUM | CRM has zero tenant scoping |
| C4 | Tenancy | MEDIUM | injectTenantId set but not used in storage calls |
| B4 | Residency | MEDIUM | ProtonMail: PII transiting Switzerland |
| D2 | Auth | MEDIUM | partnerId session auth: no DB liveness check |
| F6 | Subprocessor | LOW/? | Redis region unknown |
| B7 | Infra | — | *(Resolved: dev-host env/plugins removed.)* |
| B8 | Infra | LOW | CET timezone hardcoded |
