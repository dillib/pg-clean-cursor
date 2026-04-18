# Hosting bootstrap — Fly.io + Neon + Upstash (EU, pre-funding)

One-time setup. €0/mo until you outgrow the free tiers.

## 0. Accounts to create (all free, EU)

- **Fly.io** — https://fly.io (add a credit card; free allowance covers us)
- **Neon** — https://neon.tech (choose **Frankfurt — eu-central-1**)
- **Upstash** — https://upstash.com (choose **EU West — Frankfurt**) — optional, falls back to in-process event bus
- **Cloudflare** — https://cloudflare.com (free DNS; add your domain later)
- **GitHub** — already have this; need admin on the repo

## 1. Install CLIs (Windows, run in Git Bash or WSL)

```bash
# flyctl
curl -L https://fly.io/install.sh | sh
export PATH="$HOME/.fly/bin:$PATH"

# Neon CLI (optional; web UI works too)
npm i -g neonctl
```

Authenticate:
```bash
fly auth login
neonctl auth
```

## 2. Provision Postgres (Neon, Frankfurt)

```bash
# Create the project in Frankfurt
neonctl projects create --name photonictag --region-id aws-eu-central-1

# Grab the project_id — save it for GitHub secrets
neonctl projects list

# Two branches: prod (default main) and staging
neonctl branches create --project-id <PROJECT_ID> --name staging

# Get connection strings (use the "pooled" one for serverless-ish envs)
neonctl connection-string main    --project-id <PROJECT_ID> --pooled
neonctl connection-string staging --project-id <PROJECT_ID> --pooled
```

Save these as `PROD_DATABASE_URL` and `STAGING_DATABASE_URL`.

## 3. Provision Redis (Upstash, EU)

Web UI → Create Database → Type `Regional`, Region `EU-West-1 (Ireland)` or
`EU-Central-1 (Frankfurt)`, TLS on. Copy the **`rediss://`** connection
string. If you skip this, the app uses an in-process event bus + memory
sessions (fine for single-machine prod).

Save as `PROD_REDIS_URL` / `STAGING_REDIS_URL`.

## 4. Generate the secrets you'll paste into Fly + GitHub

```bash
# 64-hex-char (32 bytes) for AES-256-GCM connector encryption
openssl rand -hex 32   # → CONNECTOR_ENCRYPTION_KEY

# 48-byte base64 for audit chain HMAC
openssl rand -base64 48   # → AUDIT_CHAIN_HMAC_KEY

# 48-byte base64 for express-session
openssl rand -base64 48   # → SESSION_SECRET
```

Mistral key: already in your `.env.local`. Re-use it or mint a scoped one
at https://console.mistral.ai/api-keys/.

## 5. Create the Fly apps

```bash
# Prod
fly apps create photonictag-prod --org personal
fly secrets set --app photonictag-prod \
  DATABASE_URL="<PROD_DATABASE_URL>" \
  SESSION_SECRET="<SESSION_SECRET>" \
  AUDIT_CHAIN_HMAC_KEY="<AUDIT_CHAIN_HMAC_KEY>" \
  CONNECTOR_ENCRYPTION_KEY="<CONNECTOR_ENCRYPTION_KEY>" \
  AI_API_KEY="<MISTRAL_KEY>" \
  MASTER_ADMIN_EMAILS="you@yourdomain.com" \
  REDIS_URL="<PROD_REDIS_URL>"

# Staging (same recipe, different secrets)
fly apps create photonictag-staging --org personal
fly secrets set --app photonictag-staging \
  DATABASE_URL="<STAGING_DATABASE_URL>" \
  SESSION_SECRET="<staging-session-secret>" \
  AUDIT_CHAIN_HMAC_KEY="<staging-hmac>" \
  CONNECTOR_ENCRYPTION_KEY="<staging-enc-key>" \
  AI_API_KEY="<MISTRAL_KEY>" \
  MASTER_ADMIN_EMAILS="you@yourdomain.com"
```

## 6. GitHub secrets (Repo → Settings → Secrets → Actions)

| Secret | Value |
|---|---|
| `FLY_API_TOKEN` | `fly tokens create deploy` output |
| `FLY_ORG` | `personal` (or your org slug) |
| `PROD_DATABASE_URL` | pooled Neon main connection string |
| `STAGING_DATABASE_URL` | pooled Neon staging connection string |
| `NEON_PROJECT_ID` | from `neonctl projects list` |
| `NEON_API_KEY` | https://console.neon.tech/app/settings/api-keys |
| `AI_API_KEY` | Mistral API key |
| `PREVIEW_SESSION_SECRET` | `openssl rand -base64 48` |
| `PREVIEW_AUDIT_CHAIN_HMAC_KEY` | `openssl rand -base64 48` |
| `PREVIEW_CONNECTOR_ENCRYPTION_KEY` | `openssl rand -hex 32` |

Also create two GitHub **Environments** (`production`, `staging`) under
Repo → Settings → Environments. Add required reviewers on `production`
if you want a manual approval step before prod rollouts.

## 7. First deploy

```bash
# Prod
fly deploy --config fly.toml --remote-only

# Staging
fly deploy --config fly.staging.toml --remote-only

# Open each
fly open --app photonictag-prod
fly open --app photonictag-staging
```

CI takes over from there — pushes to `main` deploy prod, pushes to
`develop` deploy staging, PRs open ephemeral preview apps on their
own Neon branches.

## 8. Custom domains (Cloudflare)

```bash
fly certs add app.photonictag.com   --app photonictag-prod
fly certs add staging.photonictag.com --app photonictag-staging
```

Then in Cloudflare DNS: add a CNAME for each hostname pointing at
the Fly app (the `fly certs add` output tells you the target).
Set Cloudflare SSL mode to **Full (strict)**. Leave the orange cloud
on for DDoS + edge cache of public DPP pages.

Update the `APP_BASE_URL` env in `fly.toml` / `fly.staging.toml` to the
real hostname, then redeploy.

## 9. Observability (later)

- **Logs**: `fly logs --app photonictag-prod` works day-1. For persistence
  add the Axiom Fly integration (free 500GB/mo, EU region).
- **Errors**: create a Sentry project (free 5k events/mo), add `SENTRY_DSN`
  as a Fly secret, wire it into `server/index.ts` when you're ready.
- **Metrics**: `fly dashboard` has built-in CPU/mem/HTTP charts.

## 10. Cost ceiling (what you pay before funding)

| Service | Free tier | When you pay |
|---|---|---|
| Fly.io | 3× shared-cpu-1x-256 + 3GB storage + 160GB egress | ~€5/mo past that |
| Neon | 1 project, 0.5GB storage, unlimited branches | ~€19/mo Launch tier |
| Upstash Redis | 10k commands/day, 256MB | ~€0.2 per 100k req past that |
| Mistral | Pay-per-token, €0 minimum | Depends on traffic; ~€0.001/1k tokens |
| Cloudflare | Unlimited bandwidth, DNS, DDoS | €0 until you need Workers Pro |
| GitHub Actions | 2000 minutes/mo on private repos | €0 if repo is public |

Target: **€0–10/mo total** until you cross ~1k MAU or 10GB DB.
