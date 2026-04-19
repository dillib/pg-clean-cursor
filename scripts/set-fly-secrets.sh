#!/usr/bin/env bash
# Push secrets from a local env file to a Fly.io app.
#
# Usage:
#   scripts/set-fly-secrets.sh staging    # reads scripts/fly-secrets.staging.env → photonictag-staging
#   scripts/set-fly-secrets.sh prod       # reads scripts/fly-secrets.prod.env    → photonictag-prod
#
# The env files are gitignored (.env.* rule in .gitignore). Never commit them
# and never paste their contents into chat with an AI assistant.

set -euo pipefail

ENV_NAME="${1:-}"
if [[ "$ENV_NAME" != "staging" && "$ENV_NAME" != "prod" ]]; then
  echo "usage: $0 [staging|prod]" >&2
  exit 1
fi

if [[ "$ENV_NAME" == "prod" ]]; then
  APP="photonictag-prod"
  FILE="scripts/fly-secrets.prod.env"
else
  APP="photonictag-staging"
  FILE="scripts/fly-secrets.staging.env"
fi

if [[ ! -f "$FILE" ]]; then
  echo "error: $FILE not found." >&2
  echo "  copy scripts/fly-secrets.env.example to $FILE and fill in values." >&2
  exit 1
fi

# Pull only non-empty KEY=VALUE lines. Strip surrounding quotes. Skip comments.
declare -a PAIRS=()
while IFS= read -r line; do
  # skip blank + comments
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  # expect KEY=VALUE
  if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    val="${BASH_REMATCH[2]}"
    # strip trailing CR (Windows CRLF line endings) so the quote-strip below matches
    val="${val%$'\r'}"
    # trim surrounding double or single quotes
    if [[ "$val" =~ ^\"(.*)\"$ ]]; then val="${BASH_REMATCH[1]}"; fi
    if [[ "$val" =~ ^\'(.*)\'$ ]]; then val="${BASH_REMATCH[1]}"; fi
    # skip empty values (don't clobber existing fly secrets)
    [[ -z "$val" ]] && continue
    PAIRS+=("$key=$val")
  fi
done < "$FILE"

if [[ ${#PAIRS[@]} -eq 0 ]]; then
  echo "error: no non-empty secrets found in $FILE" >&2
  exit 1
fi

echo "→ setting ${#PAIRS[@]} secrets on $APP"
fly secrets set --app "$APP" "${PAIRS[@]}"

echo "✓ done. Verify with: fly secrets list --app $APP"
