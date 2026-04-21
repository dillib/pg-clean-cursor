#!/usr/bin/env bash
# Dump the current Postgres DB to a plain-SQL file for DR or migration.
#
# Usage:
#   ./scripts/db/dump-neon.sh                       # dumps to dump-YYYYMMDD-HHMMSS.sql
#   ./scripts/db/dump-neon.sh dump.sql              # explicit filename
#   DATABASE_URL=... ./scripts/db/dump-neon.sh      # override source
#
# Produces schema + data, no roles/grants (re-applied via migrations on restore).
# See docs/data-residency.md § "DR fallback — migrate off Neon".

set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set" >&2
  exit 2
fi

OUT="${1:-dump-$(date +%Y%m%d-%H%M%S).sql}"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "ERROR: pg_dump not found. Install postgresql-client." >&2
  exit 2
fi

echo "Dumping $DATABASE_URL -> $OUT"
pg_dump \
  --no-owner \
  --no-privileges \
  --no-comments \
  --format=plain \
  --file="$OUT" \
  "$DATABASE_URL"

echo "Done. Size: $(du -h "$OUT" | cut -f1)"
echo
echo "Next:"
echo "  1. Provision target DB in EU (Aiven Frankfurt recommended)."
echo "  2. psql \$TARGET_URL < $OUT"
echo "  3. Re-apply RLS migrations from scripts/migrations/."
echo "  4. Run ./scripts/db/verify-residency.sh with target URL set."
