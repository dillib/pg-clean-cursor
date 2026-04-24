# Ticket #0008 — Sync log status should be "failed" when import maps zero records

**Status:** open
**Assignee:** Architect (one-line fix; no agent needed)
**Created:** 2026-04-24
**Source of report:** Coder agent on ticket #0007

## Problem

In `server/routes.ts` (CSV upload handler at line ~1186) the sync-log status is computed as:

```ts
status: failed > 0 && created + updated === 0 ? "failed" : "completed",
```

Edge case this misses: when `importCSVFromBuffer` returns `mapped: 0` because field mappings aren't configured (or no source columns matched), no per-row insert is attempted, so `failed === 0` and the status closes as `"completed"`. But the sync produced **zero usable products**. Operators see a green "completed" log even though the upload was effectively a no-op.

The same logic exists in the SAP connector sync handler at `server/routes.ts:1009` — same fix applies.

## Fix (one line, two places)

```ts
// CSV upload handler (~line 1186):
status: (failed > 0 || (importResult.parsed > 0 && importResult.mapped === 0))
       && created + updated === 0
  ? "failed" : "completed",

// SAP connector sync handler (~line 1009):
// Apply analogous logic if SAP also has a "fetched but mapped nothing" case.
// Investigate first — the SAP path goes through fieldMappings differently.
```

A cleaner refactor:

```ts
const noProductsLanded = created + updated === 0;
const hadFailures = failed > 0;
const importerProducedNothing = importResult.parsed > 0 && importResult.mapped === 0;
const finalStatus = noProductsLanded && (hadFailures || importerProducedNothing) ? "failed" : "completed";
```

## Acceptance criteria

- CSV upload with valid file but zero mappings → sync log row has `status: "failed"` and `errorMessage` contains the importer's "no field mappings configured" text
- CSV upload happy path still produces `status: "completed"`
- Existing behaviour preserved: `status: "completed"` when partial success (some rows created/updated despite failures)
- Test #7 in `tests/unit/csv-upload-route.test.ts` updated to assert `"failed"` (currently asserts `"completed"` with an inline comment explaining the production divergence)
- `npm run check` clean
- All 146 unit tests + Playwright suite still green

## Out of scope

- Refactoring sync log schema (status enum is fine as-is)
- Adding new status values (e.g., `"degraded"`)
- Investigating whether SAP sync handler has the same bug (separate ticket if needed)
