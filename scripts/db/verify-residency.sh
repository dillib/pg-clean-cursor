#!/usr/bin/env bash
# Assert DATABASE_URL points to an approved EU endpoint.
#
# Usage:
#   ./scripts/db/verify-residency.sh                  # reads $DATABASE_URL
#   DATABASE_URL=... ./scripts/db/verify-residency.sh # override
#   ./scripts/db/verify-residency.sh fly-secrets.prod.env  # read from env file
#
# Exits 0 if the URL host matches an approved pattern; non-zero otherwise.
# See docs/data-residency.md for the list.

set -euo pipefail

if [[ $# -ge 1 && -f "$1" ]]; then
  # shellcheck disable=SC1090
  set -a; source <(grep -E '^DATABASE_URL=' "$1" | sed 's/\r$//'); set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set" >&2
  exit 2
fi

# Extract the host portion of the URL (between '@' and '/' or ':').
HOST=$(printf '%s\n' "$DATABASE_URL" \
  | sed -E 's|^[a-z]+://[^@]+@([^/:?]+).*|\1|')

if [[ -z "$HOST" || "$HOST" == "$DATABASE_URL" ]]; then
  echo "ERROR: Could not parse host from DATABASE_URL" >&2
  exit 2
fi

APPROVED_PATTERNS=(
  '\.eu-central-1\.aws\.neon\.tech$'
  '\.eu-west-1\.aws\.neon\.tech$'
  '\.frankfurt\.aivencloud\.com$'
  '\.eu-central-1\.rds\.amazonaws\.com$'
  '\.eu-central-1\.supabase\.co$'
  '\.eu-west-1\.supabase\.co$'
)

for pattern in "${APPROVED_PATTERNS[@]}"; do
  if [[ "$HOST" =~ $pattern ]]; then
    echo "OK: $HOST matches approved EU pattern"
    exit 0
  fi
done

echo "FAIL: $HOST is not in the approved EU endpoint list" >&2
echo "      See docs/data-residency.md for the allowed patterns." >&2
exit 1
