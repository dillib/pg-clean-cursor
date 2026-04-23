# Ticket #0001 — Test coverage: POST /api/products/:productId/scan

**Status:** open
**Assignee:** Coder agent
**Created:** 2026-04-23
**Branch:** `agent/0001-scan-endpoint-tests`

## Endpoint

- **Method + path:** `POST /api/products/:productId/scan`
- **Source:** [server/routes.ts:711-746](../../../server/routes.ts#L711-L746)
- **Auth:** public (rate-limited via `scanLimiter` from `server/middleware/rate-limit.ts` — limiter skips in `NODE_ENV=test`)
- **Storage / service deps:**
  - `storage.getProduct(productId)` — returns `Product | undefined`
  - `storage.findProductScanBySession(productId, sessionId)` — returns prior scan or null
  - `storage.recordProductScan({ productId, country, userAgent, referrer, sessionId, isUnique })` — returns the created scan record `{ id, ...}`

## Behaviours to cover

| # | Trigger | Expected response / side-effect |
|---|---------|---------------------------------|
| 1 | `storage.getProduct` returns `undefined` | `404 { error: "Product not found" }`. `recordProductScan` NOT called. |
| 2 | Valid product, minimal request | `201 { id: <scan-id> }`. `recordProductScan` called exactly once. |
| 3 | Valid product, `x-session-id` header set, no prior scan | `recordProductScan` called with `isUnique: true` and `sessionId` echoed through. |
| 4 | Valid product, `x-session-id` header set, `findProductScanBySession` returns a record | `recordProductScan` called with `isUnique: false`. |
| 5 | Valid product, NO sessionId in header or body | `recordProductScan` called with `sessionId: null` and `isUnique: false`. |
| 6 | Valid product, `Accept-Language: en-DE,en;q=0.9` | `recordProductScan` called with `country: "DE"`. |
| 7 | Valid product, `User-Agent` and `Referer` strings each 400 chars long | `recordProductScan` called with both values truncated to exactly 255 chars. |

## Acceptance criteria

- One Vitest unit test file: **`tests/unit/scan-endpoint.test.ts`**
- All 7 behaviours above have at least one passing assertion
- Storage layer mocked via `vi.mock("../../server/storage", ...)` — match the pattern used in `tests/unit/require-admin.test.ts`
- Use `supertest` against an Express app with the route handler mounted, OR call the handler directly with mocked `req`/`res` — pick whichever the existing tests favour
- No production code modified (zero diff in `server/`, `client/`, `shared/`)
- `npm run check` clean
- `npm run test:unit -- tests/unit/scan-endpoint.test.ts` green
- All other unit tests still green: `npm run test:unit`

## Out of scope (do not do)

- E2E test for this endpoint (separate ticket if needed)
- Testing rate-limiter behaviour (covered in `rate-limit.test.ts`)
- Testing `GET /api/products/:productId/scan-analytics` (separate ticket)
- Refactoring the route handler — even if you spot a bug, log it in your report
- Adding `supertest` to dependencies if it isn't already present — escalate as a blocker

## Notes for the agent

- Look at `tests/unit/require-admin.test.ts` for the `vi.mock` pattern and `makeRes()` helper shape — those are the local conventions.
- `tests/setup.ts` already sets `NODE_ENV=test`, so you don't need to set it again.
- The handler reads `req.headers["x-session-id"]`, `req.headers["user-agent"]`, `req.headers.referer`, and `req.headers["accept-language"]`. Construct your `req` accordingly.
- The `country` regex is `/[a-z]{2}-([A-Z]{2})/` — test with a value that matches AND a value that doesn't, to make sure parsing is correct (the second case is a bonus, not in the table).

## Definition of done in one command

```bash
npm run check && npm run test:unit -- tests/unit/scan-endpoint.test.ts
```

Both must exit 0.
