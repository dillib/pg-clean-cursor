# Ticket #0002 — Test coverage: SAPODataClient.fetchMaterialsAsSAPMaterial + updateMaterial

**Status:** open
**Assignee:** Coder agent (test archetype)
**Created:** 2026-04-23
**Branch:** `feat/sap-real-odata-path` (already exists; same branch as the production change)

## Why this ticket exists

Brief 2026-17 top opportunity #1 ("Cut the SAP mock out of the production sync path") added two new methods to `SAPODataClient` and refactored four sync routes to use them. The brief's acceptance criterion (c) requires an integration test proving the sync path goes through `SAPODataClient`, not `sapMockService` directly. This ticket covers the new client methods as a unit; a follow-up ticket will cover the route-level integration.

## Surface under test

**File:** `server/services/sap-odata-client.ts`

- `SAPODataClient.isMockHost()` — public helper, returns true when hostname is empty / contains "mock" / equals "demo.sap.example.com"
- `SAPODataClient.fetchMaterialsAsSAPMaterial(options?)` — wrapper returning `{ materials: SAPMaterial[]; totalCount: number; usedMock: boolean; error?: string }`
- `SAPODataClient.updateMaterial(materialNumber, payload)` — returns `{ success: boolean; usedMock: boolean; error?: string }`. PATCH for S/4HANA + Business_One, PUT for ECC. Mock-fallback delegates to `sapMockService.updateMaterial()` when `isMockHost()` is true.

## Behaviours to cover

| # | Trigger | Expected response / side-effect |
|---|---------|---------------------------------|
| 1 | `isMockHost()` with hostname `""` | returns `true` |
| 2 | `isMockHost()` with hostname `"mock.sap.local"` | returns `true` |
| 3 | `isMockHost()` with hostname `"demo.sap.example.com"` | returns `true` |
| 4 | `isMockHost()` with hostname `"s4hana.acme.com"` | returns `false` |
| 5 | `fetchMaterialsAsSAPMaterial()` with mock host | returns `usedMock: true`, materials length matches `sapMockService.getAllMaterials().length`, no `fetch` call made |
| 6 | `fetchMaterialsAsSAPMaterial()` with real host, OData returns 2 materials | returns `usedMock: false`, materials length 2, MARA.MATNR equals OData `Material` field, MARC.WERKS equals OData `Plant` |
| 7 | `fetchMaterialsAsSAPMaterial()` with real host, OData call throws | returns `usedMock: true`, falls back to `sapMockService.getAllMaterials()`, `error` field populated |
| 8 | `updateMaterial(matnr, payload)` with mock host, matnr exists in mock | returns `{ success: true, usedMock: true }`, no `fetch` call made, mock material's MAKTX is updated |
| 9 | `updateMaterial(matnr, payload)` with mock host, matnr does NOT exist in mock | returns `{ success: false, usedMock: true, error: "Material not found in mock store" }` |
| 10 | `updateMaterial(matnr, payload)` with `systemType: "S4HANA"`, real host, OData returns 204 | calls `fetch` with method `PATCH`, URL path includes `/Product('MAT123')`, returns `{ success: true, usedMock: false }` |
| 11 | `updateMaterial(matnr, payload)` with `systemType: "ECC"`, real host, OData returns 200 | calls `fetch` with method `PUT`, URL path includes `/MaterialSet('MAT123')`, returns `{ success: true, usedMock: false }` |
| 12 | `updateMaterial(matnr, payload)` with real host, OData returns 400 with body | returns `{ success: false, usedMock: false, error: <string starting with "OData ... failed: HTTP 400"> }` |
| 13 | `updateMaterial(matnr, payload)` with real host, fetch throws | returns `{ success: false, usedMock: false, error: <string> }`, never throws |

## Acceptance criteria

- One Vitest unit test file: **`tests/unit/sap-odata-client.test.ts`**
- All 13 behaviours above have at least one passing assertion
- `fetch` is mocked via `vi.stubGlobal("fetch", vi.fn())` — match the existing local pattern (no test calls a real network)
- `sapMockService` may be imported real (it's an in-memory module with no external deps); test #8 can call `sapMockService.addMaterial(...)` or use one of the seeded MATNRs (`sapMockService.getAllMaterials()[0].MARA.MATNR`) before asserting
- No production code modified (zero diff in `server/services/sap-odata-client.ts` after this ticket)
- `npm run check` clean
- `npm run test:unit -- tests/unit/sap-odata-client.test.ts` green
- All other unit tests still green: `npm run test:unit`

## Out of scope

- Route-level integration tests (separate ticket — covers `/sync/from-sap`, `/sync/to-sap`, `/sync/bidirectional`, `/api/integrations/connectors/:id/sync` with the new client wired in)
- Testing the existing `fetchMaterials()` / `fetchMaterial()` methods (pre-existing surface, can be a separate ticket if there's an audit need)
- Testing the OAuth2 token cache (`getOAuthToken`) — exists pre-this-PR, separate ticket
- Testing `applyFieldMappings` / `flattenMaterial` / `applyTransformation` — separate ticket
- Adding HTTP test fixtures for real SAP responses — assertions on the mocked `fetch` call args are sufficient

## Notes for the agent

- Read `tests/unit/scan-endpoint.test.ts` for the local test style (vi.mock pattern, supertest-OR-direct call decision, descriptive test names).
- `tests/setup.ts` sets `NODE_ENV=test` and a few env vars — already loaded.
- `sapMockService` is an exported singleton — use `import { sapMockService } from "../../server/services/sap-mock-service"`.
- The class `SAPODataClient` is exported from `../../server/services/sap-odata-client` — instantiate with a config matching the `SAPConfig` interface.
- For tests #10–#13, capture the call to mocked `fetch` via `mockFetch.mock.calls[0]` and assert on `[url, init.method]`.
- `AbortSignal.timeout()` is used inside `updateMaterial` — that's fine in Node 20+, no special handling needed in tests.

## Definition of done in one command

```bash
npm run check && npm run test:unit -- tests/unit/sap-odata-client.test.ts
```

Both must exit 0.
