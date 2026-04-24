# Ticket #0003 — Test coverage: /product/demo renders the canonical scan page

**Status:** open
**Assignee:** Coder agent (test archetype)
**Created:** 2026-04-23
**Branch:** `feat/consolidate-public-scan` (already exists; same branch as the production change)

## Why this ticket exists

Brief 2026-17 opportunity #2 ("Pick one public-scan page; delete the other") is being shipped. `client/src/pages/public-scan.tsx` (legacy v1, ~1500 lines, shadcn) was deleted; `public-scan-v2.tsx` is now mounted at `/product/:id`. The brief's acceptance criterion (6) calls for a test that resolves `/product/demo` and asserts the canonical brand-system page renders.

`tests/unit/` is Vitest in node environment (no jsdom), so component-render tests don't fit there. The right place is **Playwright E2E** — `tests/e2e/` already contains `public-scan.spec.ts` (API-level only) so this ticket adds page-level coverage.

## Surface under test

**Route:** `GET /product/demo` (no DB read; uses the static fixture from `client/src/lib/demo-passport.ts`)

**Page:** `client/src/pages/public-scan-v2.tsx` (the canonical consumer passport page)

## Behaviours to cover

| # | Trigger | Expected DOM evidence |
|---|---------|------------------------|
| 1 | Navigate to `/product/demo` | HTTP 200, `<h1>` or `[data-testid="text-public-product-name-v2"]` contains `"EcoPower Li-Ion Battery Pack 5000mAh"` |
| 2 | Same page | manufacturer text `"GreenCell Technologies GmbH"` visible |
| 3 | Same page | Compliance deadline banner present: `[data-testid="banner-compliance-deadline"]` is visible AND contains the text `"February 18, 2027"` (Batteries → urgent EU Battery Reg deadline) |
| 4 | Same page | Trace timeline section renders at least one `[data-testid^="public-trace-event-v2-"]` element (demo fixture has 4 events) |
| 5 | Same page | Yellow "demo" banner is visible at the top — match by text containing `"This is an example passport"` |
| 6 | Same page | Register/share section is **NOT** visible — the v2 page hides it in demo mode. Use `expect(page.getByTestId("section-register-share-v2")).toHaveCount(0)` |
| 7 | Navigate to `/product/00000000-0000-0000-0000-000000000001` (a known-bad UUID) | The 404 passport message renders — match by text containing `"This passport doesn't exist"` |

## Acceptance criteria

- One new Playwright spec file: **`tests/e2e/public-scan-page.spec.ts`** (don't conflict with the existing API-only `public-scan.spec.ts`)
- All 7 behaviours have at least one passing assertion
- Use the existing Playwright config (no config changes — base URL is set in `playwright.config.ts`)
- No production code modified
- `npm run check` clean
- `npm run test:e2e -- public-scan-page.spec.ts` green
- Existing API tests in `public-scan.spec.ts` still green

## Out of scope

- Testing the registration dialog interaction (would need a real product in DB; separate ticket)
- Testing share-button click behavior (would need clipboard mocking; separate ticket)
- Testing AI insights / regional extensions render (works only with a real product; separate ticket)
- i18n behavior (separate brief opportunity, not in this PR)
- Visual regression / screenshot tests (separate concern)

## Notes for the agent

- Playwright config: read `playwright.config.ts` to confirm the dev-server `baseURL` and any auth setup.
- Use `page.goto("/product/demo")` (relative — let baseURL resolve).
- For data-testid lookups, prefer `page.getByTestId("…")` over CSS selectors.
- The deadline banner uses `<strong>February 18, 2027</strong>` — `page.getByTestId("banner-compliance-deadline")` should `.toContainText("February 18, 2027")`.
- The legacy `/product/:id/v2` route was REMOVED in this PR — do not test it.

## Definition of done in one command

```bash
npm run check && npm run test:e2e -- public-scan-page.spec.ts
```

Both must exit 0.
