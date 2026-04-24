# Ticket #0005 — Test coverage: csv-import-service + applyFieldMappingsToRecord

**Status:** open
**Assignee:** Coder agent (test archetype)
**Created:** 2026-04-23
**Branch:** `feat/csv-lite-connector`

## Why this ticket exists

PR #6 added the CSV-lite connector backend: `applyFieldMappingsToRecord()` (generalized field-mapping engine), `csv-import-service.ts` (parse + map), and `POST /api/integrations/connectors/:id/upload`. This ticket covers the new pure-logic surface area as Vitest unit tests.

The route handler itself has heavy storage / multer dependencies — not unit-test material. A separate E2E ticket (or post-#0006 UI work) covers the full upload path against a running server.

## Surface under test

**Files:**
- `server/services/sap-odata-client.ts` — new export `applyFieldMappingsToRecord(source, mappings, baseDefaults?)`
- `server/services/csv-import-service.ts` — `parseSpreadsheetBuffer`, `applyMappingsToRows`, `importCSVFromBuffer`

## Behaviours to cover

| # | Trigger | Expected response / side-effect |
|---|---------|---------------------------------|
| 1 | `applyFieldMappingsToRecord({foo:"bar"}, [{sourceField:"foo",targetField:"productName"}])` | returns `{ productName: "bar" }` |
| 2 | Same call with `baseDefaults: {description: "fallback"}` | returns `{ description: "fallback", productName: "bar" }` |
| 3 | Mapping with `transformation: "uppercase"` against `{ name: "abc" }` | returns mapped value as `"ABC"` |
| 4 | Mapping with empty `sourceField` (whitespace) | mapping ignored; result has no key for that mapping |
| 5 | Source key absent in record | mapping ignored; key not present in result |
| 6 | `parseSpreadsheetBuffer` on a small inline CSV (header row + 2 data rows) | returns `{ headers: [...], rows: [{...}, {...}] }`; blank rows skipped |
| 7 | `parseSpreadsheetBuffer` on a CSV with a trailing blank row | blank row is skipped (rows.length === 2 not 3) |
| 8 | `parseSpreadsheetBuffer` on an empty buffer / no sheets | throws `Error("File contains no sheets")` |
| 9 | `applyMappingsToRows` with rows that produce zero mapped fields | result.errors contains a "no fields mapped" message; result.mapped is 0 |
| 10 | `importCSVFromBuffer` with valid CSV and good mappings | returns `{ parsed: N, mapped: N, records: [...], errors: [] }` |
| 11 | `importCSVFromBuffer` with valid CSV but `mappings: []` | returns `{ parsed: N, mapped: 0, records: [], errors: [/no field mappings configured/] }` |
| 12 | `importCSVFromBuffer` with empty CSV (header only, no rows) | returns `{ parsed: 0, mapped: 0, records: [], errors: ["File contains no data rows"] }` |

## Acceptance criteria

- One Vitest file: **`tests/unit/csv-import-service.test.ts`**
- All 12 behaviours have at least one passing assertion
- Use `Buffer.from("…")` to construct in-memory CSV inputs — no fixture files
- The `xlsx` library is already a dependency, no additional installs
- No production code modified
- `npm run check` clean
- `npm run test:unit -- tests/unit/csv-import-service.test.ts` green
- All other unit tests still green: `npm run test:unit`

## Out of scope

- Testing the upload route handler (multer + storage + tenant scoping — needs supertest with the full Express app; separate ticket)
- Testing transformations exhaustively (`trim`, `lowercase`, `boolean`, `number`, `date_iso`) — covered by SAP applyFieldMappings tests already; one transformation case here is enough sanity
- Testing real XLSX file parsing (binary fixtures are heavy; CSV is the common path)

## Notes for the agent

- Read `tests/unit/sap-odata-client.test.ts` for the `vi.mock` / direct-call pattern.
- For `parseSpreadsheetBuffer` tests, build CSVs as multi-line strings and pass `Buffer.from(text)`.
- Remember CSV files: header row at index 0; the parser converts row index → row 2+ in error messages (matches spreadsheet UX).
- The `applyTransformation` function lives inside `sap-odata-client.ts` and isn't exported — test it indirectly via `applyFieldMappingsToRecord` with a `transformation` field on the mapping.

## Definition of done in one command

```bash
npm run check && npm run test:unit -- tests/unit/csv-import-service.test.ts
```

Both must exit 0.
