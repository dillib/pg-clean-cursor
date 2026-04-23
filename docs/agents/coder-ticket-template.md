# Coder ticket template

A Coder ticket is the contract between the human and the Coder agent. It must be specific enough that two Coders given the same ticket would produce equivalent test files.

> **One ticket = one endpoint = one PR.** If you find yourself wanting to scope two endpoints, write two tickets.

---

## Required sections

```markdown
# Ticket #<n> — Test coverage: <ENDPOINT>

## Endpoint
- **Method + path:** `POST /api/products/:productId/scan`
- **Source:** `server/routes.ts:711-746`
- **Auth:** public (rate-limited via `scanLimiter`)
- **Storage / service deps:** `storage.getProduct`, `storage.findProductScanBySession`, `storage.recordProductScan`

## Behaviours to cover
For each behaviour, provide: trigger condition → expected response/side-effect.

1. **404 when product missing** — `storage.getProduct` returns null → `404 { error: "Product not found" }`. No scan recorded.
2. **201 with scan id on success** — valid product → `201 { id: <uuid> }`. `storage.recordProductScan` called once.
3. **isUnique=true on first scan from session** — valid product, sessionId in header, no prior scan from session → `recordProductScan` called with `isUnique: true`.
4. **isUnique=false on repeat scan from same session** — valid product, sessionId in header, `findProductScanBySession` returns a prior scan → `recordProductScan` called with `isUnique: false`.
5. **isUnique=false when no sessionId** — no `x-session-id` header, no `body.sessionId` → `recordProductScan` called with `isUnique: false`.
6. **country parsed from accept-language** — `Accept-Language: en-DE` → `recordProductScan` called with `country: "DE"`.
7. **userAgent + referrer truncated to 255 chars** — long inputs → values passed to storage are exactly 255 chars.

## Acceptance criteria
- One Vitest unit test file: `tests/unit/scan-endpoint.test.ts`
- All 7 behaviours above have at least one passing assertion
- Storage layer mocked via `vi.mock` (existing pattern in `require-admin.test.ts`)
- No production code modified
- `npm run check` clean
- `npm run test:unit -- tests/unit/scan-endpoint.test.ts` green

## Out of scope (do not do)
- E2E test (separate ticket)
- Testing rate limiter behaviour (already covered in `rate-limit.test.ts`)
- Testing scan-analytics endpoint (separate ticket)
- Refactoring the route handler — even if you spot a bug
```

---

## Why this format

- **Endpoint identification by file:line** — saves the agent recon time and removes ambiguity. Pin to a commit SHA if the file is volatile.
- **Behaviours as trigger → expected** — the agent generates one test per row. Reviewer can grade output by ticking rows off.
- **Acceptance criteria as a runnable command** — turns "is it done?" into a single `npm` invocation.
- **Out-of-scope is explicit** — drift is the #1 failure mode. Naming the seductive adjacent work and forbidding it is cheaper than reviewing a 600-line PR.

## When NOT to use this template

- The endpoint behaviour isn't yet stable / understood. Write the endpoint first; ticket the test second.
- The endpoint requires a real Postgres instance to test meaningfully — file an integration-test ticket using a different template (TBD).
- The "endpoint" is actually a workflow across 3+ endpoints. Decompose into per-endpoint tickets.
