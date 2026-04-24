# Ticket #0007 — Test coverage: POST /api/integrations/connectors/:id/upload

**Status:** open
**Assignee:** Coder agent (test archetype)
**Created:** 2026-04-24
**Branch:** `feat/csv-connector-ui`

## Why this ticket exists

PR #6 added `csv-import-service.ts` (covered by ticket #0005). But the route handler `POST /api/integrations/connectors/:id/upload` (server/routes.ts:1083+) wasn't unit-tested — it owns the orchestration logic: connector type gate, file presence check, sync-log lifecycle, modelNumber-based create-vs-update branching, error aggregation. This ticket closes that gap.

The handler is inline in `registerRoutes()` and not exportable, so this ticket uses the **mirror-handler pattern** from ticket #0001: mount an equivalent route on a small Express app with mocked storage, exercise via supertest, assert behaviour.

## Surface under test

**Route:** `POST /api/integrations/connectors/:id/upload` (multipart, field name `file`)

**Source:** `server/routes.ts` lines ~1083–1186

**Dependencies that must be mocked:**
- `storage` (read connector, create/update sync log, update connector)
- `tenantStorage(req)` (scoped product reads + writes)
- `csv-import-service.ts` `importCSVFromBuffer` (already unit-tested in #0005; here either mock it or pass a small in-memory CSV through the real service)
- `isAuthenticatedOrTeam` middleware → call `next()` directly

## Behaviours to cover

| # | Trigger | Expected response |
|---|---------|-------------------|
| 1 | POST with no file (multipart but no `file` field) | `400 { error: /No file uploaded/ }` |
| 2 | POST to a connectorId that returns null from `tenantStorage(req).getEnterpriseConnector` | `400` from missing-connector branch is wrong; should be `404 { error: "Connector not found" }` |
| 3 | POST to a connector with `connectorType: "sap"` (not csv) | `400 { error: /Upload is only supported for csv/ }` |
| 4 | POST a 2-row CSV to a csv connector with valid mappings, no existing products | `200 { success: true, parsed: 2, mapped: 2, created: 2, updated: 0, failed: 0 }`. `storage.createIntegrationSyncLog` called with `status: "running"`. `storage.updateIntegrationSyncLog` called with `status: "completed"` and `recordsCreated: 2`. `tenantStorage(req).createProduct` called twice. |
| 5 | POST a 2-row CSV where one row's modelNumber matches an existing product | `created: 1, updated: 1`. `tenantStorage.updateProduct` called once with the existing id. `tenantStorage.createProduct` called once. |
| 6 | POST a CSV but `tenantStorage.createProduct` throws on every row | `failed === parsed`, response `status` from sync log update is `"failed"`, response `firstError` is non-null. |
| 7 | POST a CSV to a csv connector with empty `fieldMappings` array | response `mapped: 0`, errors[] contains `/no field mappings configured/i`, sync log status is `"failed"` (no records created). |

## Acceptance criteria

- One Vitest file: **`tests/unit/csv-upload-route.test.ts`**
- All 7 behaviours have at least one passing assertion
- Use `supertest` (already a dep, used by approach in ticket #0001)
- Use `vi.mock` for `../../server/storage` and `../../server/storage-tenant`
- Mount a minimal Express app with `multer` + the mirrored handler — match the production handler's logic exactly. If the production handler diverges from the mirror, the test should fail (that's the point).
- No production code modified
- `npm run check` clean
- `npm run test:unit -- tests/unit/csv-upload-route.test.ts` green
- All other unit tests still green: `npm run test:unit`

## Out of scope

- Auth middleware testing (`isAuthenticatedOrTeam` is bypassed in the mirror app)
- Browser-level testing of the CSV connector UI page (`csv-connector.tsx`) — needs real auth setup; defer to a future Playwright auth-fixture ticket
- Multer error edge cases (file > 10 MB, unsupported MIME) — separate ticket

## Notes for the agent

- Read `tests/unit/scan-endpoint.test.ts` for the mirror-handler + supertest pattern.
- Read `tests/unit/csv-import-service.test.ts` for in-memory CSV building (`Buffer.from("col1,col2\nval1,val2\n")`).
- Read `tests/unit/sap-odata-client.test.ts` for `vi.mock` import patterns.
- The real `importCSVFromBuffer` is fast and pure — call it for real in tests #4–#7 instead of mocking it. Saves you from re-implementing the CSV parse stub.
- For test #5, you'll need to set up `tenantStorage(req).getAllProducts()` to return one product whose `modelNumber` matches a row from your CSV.
- The handler casts `(connector.fieldMappings ?? []) as FieldMapping[]` — provide that on the mocked connector.

## Definition of done in one command

```bash
npm run check && npm run test:unit -- tests/unit/csv-upload-route.test.ts
```

Both must exit 0.
