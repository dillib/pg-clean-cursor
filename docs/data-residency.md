# Data residency (EU)

PhotonicTag targets EU enterprise customers. All customer data must remain
in the EU at rest and in transit.

## Current state

| Component | Provider | Region | Residency |
|---|---|---|---|
| Primary Postgres | Neon | `eu-central-1` (Frankfurt) | EU ✓ |
| Fly apps (prod + staging) | Fly.io | `fra` (Frankfurt) | EU ✓ |
| Session store (Redis) | Upstash | EU-West Frankfurt (optional; falls back to in-process) | EU ✓ |
| Transactional email | Brevo | EU (Sendinblue/Paris) | EU ✓ |
| SSO | WorkOS | US HQ, SCC + DPA in place | Cross-border under SCCs |
| Object storage | n/a (none yet) | — | — |
| Logs (pino → stdout) | Fly.io in-region | `fra` | EU ✓ |

## How we enforce it

1. **`scripts/db/verify-residency.sh`** — asserts `DATABASE_URL` host matches an
   approved EU endpoint pattern. Run locally against `fly-secrets.{staging,prod}.env`
   after any secret rotation; hook into deploy scripts before go-live.
2. **`scripts/deploy.sh`** — calls the verifier before `fly deploy` and aborts
   if the DB URL is not EU.
3. **Sub-processor list** — `client/src/pages/dpa.tsx` (the DPA page, scaffolded
   in commercial-launch prep) lists every sub-processor plus region.

## Approved EU endpoint patterns

- `*.eu-central-1.aws.neon.tech` — Neon Frankfurt (primary + branches)
- `*.eu-west-1.aws.neon.tech` — Neon Ireland (secondary if ever needed)
- `*.frankfurt.aivencloud.com` — Aiven Frankfurt (DR fallback)
- `*.eu-central-1.rds.amazonaws.com` — RDS Frankfurt (future option)
- `*.eu-west-1.supabase.co` / `*.eu-central-1.supabase.co` — Supabase EU (DR fallback)

Anything else fails the verifier.

## DR fallback — migrate off Neon

If Neon ever becomes unavailable or we need to move providers, the procedure:

1. **Provision target** in the EU region of choice (Aiven Frankfurt is the
   current recommended fallback — managed, EU-HQ'd company, ISO 27001).
2. **Drain write traffic** — set the app to read-only (or take a 5-minute
   maintenance window).
3. **Dump** — `scripts/db/dump-neon.sh > dump.sql` (plain SQL, includes schema
   + data but not roles/grants; we re-apply those via migrations).
4. **Restore** — `psql $TARGET_URL < dump.sql`.
5. **Re-apply migrations** — run `scripts/migrations/001_rls_tenant_isolation.sql`,
   `002_tenancy_and_encryption.sql`, `003_crm_tenant_id.sql` against the new
   target. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables
   WHERE schemaname='public' AND tablename IN ('products','identities','leads');`
   — every row's `rowsecurity` must be `t`.
6. **Flip `DATABASE_URL`** on Fly: `fly secrets set DATABASE_URL=... -a photonictag-staging`
   (staging first), then `-a photonictag-prod`. Each triggers a rolling restart.
7. **Verify** — `curl https://.../healthz` returns 200, `curl https://.../api/public/demo-products`
   returns product list, authed `GET /api/products` returns 401 (tenant gate).
8. **Update residency verifier** — add the new host pattern to
   `scripts/db/verify-residency.sh` and to this doc's "Approved EU endpoint
   patterns" list.

Expected downtime: 5–15 minutes depending on DB size. No data loss if the
dump is taken while the app is read-only.

## Customer-facing commitments

- Data at rest: Frankfurt.
- Backups: Neon's point-in-time recovery (7 days on free tier, 30+ on paid).
  Backups are stored in the same region.
- Personal data retention: see `client/src/pages/privacy.tsx` (GDPR Art. 5(1)(e)).
- Sub-processor updates: 30 days notice before adding a non-EU sub-processor.

## Known caveats

- **WorkOS is US-HQ'd.** Authentication metadata (email, user id) is processed
  in the US under SCCs. This is disclosed in `privacy.tsx`.
- **AI provider calls** (Anthropic / OpenAI for demo) may cross borders.
  Disclose in privacy policy; for enterprise tier, offer "EU-only AI" opt-in
  (not yet implemented — tracked as a future PR).
