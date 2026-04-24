# Ticket #0009 — Test coverage: verifyAuditChain + SQL migration runner

**Status:** open
**Assignee:** Coder agent (test archetype)
**Created:** 2026-04-24
**Branch:** `feat/append-only-audit-log`

## Why this ticket exists

The append-only audit log work in this branch ships three new pieces:
- **DB trigger** (`server/db/sql/001_audit_logs_append_only.sql`) — needs a live DB to test, defer to integration suite
- **`runSqlMigrations()`** (`server/db/migrate.ts`) — file system + pool interaction, unit-testable with mocks
- **`verifyAuditChain()`** (`server/services/audit-integrity-service.ts`) — pure-ish (depends only on `storage.getAuditLogs`), unit-testable with mocked storage

This ticket covers the JS pieces. A follow-up ticket will wire the trigger into a real-DB integration test.

## Surface under test

**`verifyAuditChain(opts?)`** — `server/services/audit-integrity-service.ts`

**`runSqlMigrations(opts?)`** — `server/db/migrate.ts`

## Behaviours to cover

### `verifyAuditChain`

| # | Trigger | Expected report |
|---|---------|------------------|
| 1 | Empty audit log | `{ totalEntries: 0, verifiedEntries: 0, legacyEntries: 0, passed: true, failures: [], chainTip: null }` |
| 2 | Single valid entry (genesis: `previousChainHash === null`, valid `chainHash`) | `passed: true`, `verifiedEntries: 1`, `chainTip` equals the entry's chainHash |
| 3 | Two valid entries chained correctly | `passed: true`, `verifiedEntries: 2`, no failures |
| 4 | Entry with tampered `newValue` (chainHash no longer matches re-computed hash) | `failures` contains one `hash_mismatch` with the expected vs. actual hashes |
| 5 | Two entries where the second's `previousChainHash` doesn't match the first's `chainHash` | `failures` contains one `chain_break` with expected/actual previous hashes |
| 6 | Mix of legacy (chainHash === null) + valid entries | legacy entries counted in `legacyEntries`, not in failures; chain walk continues from valid entries only |
| 7 | Multiple failures across the chain | `failures` array reports all (or up to 50); `firstFailureAt` is the earliest index |

### `runSqlMigrations`

| # | Trigger | Expected behaviour |
|---|---------|---------------------|
| 8 | `NODE_ENV === "test"` and no `{ force: true }` | returns `{ applied: [], skipped: [] }` immediately; no pool calls |
| 9 | Force flag passed in test env, with one new SQL file | calls pool.query for the file content; records the filename in `_pt_sql_migrations` |
| 10 | Force flag, file already in `_pt_sql_migrations` | file is skipped (in `skipped[]`, not `applied[]`); pool.query NOT called for the file content |
| 11 | A SQL file throws during execution | `runSqlMigrations` rejects; the `_pt_sql_migrations` insert is rolled back via `BEGIN/ROLLBACK` |

## Acceptance criteria

- One Vitest file: **`tests/unit/audit-integrity.test.ts`** (covers behaviours #1–#7)
- One Vitest file: **`tests/unit/sql-migrations.test.ts`** (covers behaviours #8–#11)
- All 11 behaviours have at least one passing assertion
- For `verifyAuditChain`: mock `../../server/storage` to return crafted AuditLog arrays. Use the real `computeAuditChainHash` from `provenance-service.ts` to produce valid chain hashes for fixtures.
- For `runSqlMigrations`: mock `../../server/db` (the `pool` export) and `node:fs/promises` (`readdir`, `readFile`). Verify `BEGIN` → SQL → `COMMIT` order on the happy path; `BEGIN` → throw → `ROLLBACK` on failure.
- No production code modified
- `npm run check` clean
- `npm run test:unit -- tests/unit/audit-integrity.test.ts tests/unit/sql-migrations.test.ts` green
- All other unit tests still green: `npm run test:unit`

## Out of scope

- Trigger-blocks-UPDATE / trigger-blocks-DELETE assertions — needs a real DB (separate integration ticket)
- Endpoint-level test for `GET /api/audit/integrity` — needs auth + tenant setup (separate ticket if needed)
- Performance testing on million-row chains
- TSA (RFC 3161) timestamp verification

## Notes for the agent

- Read `tests/unit/sap-odata-client.test.ts` for the `vi.mock` pattern.
- `provenance-service.ts` requires `AUDIT_CHAIN_HMAC_KEY` env var — already set in `tests/setup.ts`.
- For chain-hash fixtures, use the real `computeAuditChainHash`:
  ```ts
  import { computeAuditChainHash } from "../../server/services/provenance-service";
  const hash = computeAuditChainHash({ previousHash: null, timestamp: "2026-01-01T00:00:00.000Z", action: "create", entityType: "product", entityId: "p1", newValue: { name: "X" } });
  ```
- `AuditLog.timestamp` is a `Date` — pass `new Date("2026-01-01T00:00:00.000Z")` so `.toISOString()` is deterministic.
- For `runSqlMigrations`, `vi.mock("../../server/db", ...)` to provide a fake `pool` whose `connect()` returns a fake client with stubbed `query` and `release`. Match the real pg.PoolClient shape.

## Definition of done in one command

```bash
npm run check && npm run test:unit -- tests/unit/audit-integrity.test.ts tests/unit/sql-migrations.test.ts
```

Both must exit 0.
