#!/usr/bin/env bash
# Local deploy helper. Runs DB migration first, then Fly deploy.
# Reads DATABASE_URL from scripts/fly-secrets.<env>.env so you don't have to
# export it manually.
#
# Usage:
#   scripts/deploy.sh staging
#   scripts/deploy.sh prod

set -euo pipefail

ENV_NAME="${1:-}"
if [[ "$ENV_NAME" != "staging" && "$ENV_NAME" != "prod" ]]; then
  echo "usage: $0 [staging|prod]" >&2
  exit 1
fi

if [[ "$ENV_NAME" == "prod" ]]; then
  APP="photonictag-prod"
  FILE="scripts/fly-secrets.prod.env"
  CONFIG="fly.toml"
else
  APP="photonictag-staging"
  FILE="scripts/fly-secrets.staging.env"
  CONFIG="fly.staging.toml"
fi

if [[ ! -f "$FILE" ]]; then
  echo "error: $FILE not found — run scripts/set-fly-secrets.sh first." >&2
  exit 1
fi

# Extract DATABASE_URL from the env file (don't export — keep it in this shell)
DB_URL="$(grep -E '^DATABASE_URL=' "$FILE" | head -1 | sed -E 's/^DATABASE_URL=//; s/^"(.*)"$/\1/; s/^'"'"'(.*)'"'"'$/\1/')"
if [[ -z "$DB_URL" ]]; then
  echo "error: DATABASE_URL missing or empty in $FILE" >&2
  exit 1
fi

echo "→ [1/3] verifying EU data residency"
DATABASE_URL="$DB_URL" bash scripts/db/verify-residency.sh

echo "→ [2/3] migrating $ENV_NAME database"
DATABASE_URL="$DB_URL" npm run db:push

echo "→ [3/3] deploying $APP"
fly deploy --config "$CONFIG" --remote-only

echo "✓ $ENV_NAME deploy complete"
fly status --app "$APP"
