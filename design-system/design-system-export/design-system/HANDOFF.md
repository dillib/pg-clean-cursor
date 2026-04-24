# Handoff to Claude Code / any developer

This document is the single entry point for turning the PhotonicTag design system into shipped product. Everything needed is in this project.

## What this project contains

- **Design tokens** — `colors_and_type.css` · single CSS file with every color, spacing, radius, hairline, and type variable. Drop it in.
- **Fonts** — `fonts/fonts.css` · Geist + Geist Mono (SIL OFL 1.1), variable weights 100–900. Currently `@import`-ed from Google Fonts. For production, install the [`geist`](https://www.npmjs.com/package/geist) npm package and swap the import for local WOFF2 paths.
- **Brand assets** — `assets/` · logomark + wordmark, dark and light variants. The mark is a stamp-within-a-stamp glyph in `#FFDF00` on `#000000`.
- **Design-system previews** — `preview/*.html` · self-contained specimen cards for every token group. Treat them as the visual spec.
- **Reference UI kits** (React via Babel-in-browser — rewrite into your framework):
  - `ui_kits/_shared/Primitives.jsx` — `Button`, `Badge`, `Eyebrow`, `Mono`, `Icon`, `Wordmark`, `BrandMark`, `Kbd`, `DotDivider`
  - `ui_kits/marketing/` — Home (`index.html`) with Hero, Logo bar, Big statement, Regulation grid, Feature split (audit log), Steps, Quote, Pricing, CTA, Footer
  - `ui_kits/app/` — Authenticated dashboard with Sidebar, Header, Catalog table + stats
  - `ui_kits/passport_viewer/` — Public mobile passport surface, framed inside an iOS device

## How to ship it

1. **Adopt the tokens first.** Copy `colors_and_type.css` and `fonts/` into your app. Every color, spacing, and type value should read from these variables — never hard-coded.
2. **Rebuild primitives in your framework.** Translate `ui_kits/_shared/Primitives.jsx` into your stack (React + Tailwind, Vue, Svelte, whatever). Keep component names, prop shapes, and visual contracts the same so the kits stay useful as a spec.
3. **Rebuild screens as features, not as static HTML.** The marketing and app kits are reference compositions — don't ship the Babel-in-browser version. Port each section into your router + CMS.
4. **Wire real data.** The kits contain plausible but fake data (SKUs, GTINs, timestamps, audit log). Replace with your models. All placeholder data is shaped against ESPR / CIRPASS so the API contract should be obvious.
5. **Icons.** The kit uses hand-drawn Lucide-style SVGs. Swap to `lucide-react` (or equivalent) in production — the shape language matches.

## Product scope (for a Claude Code session)

Brief a developer agent with this list:

### Marketing site (Next.js / Astro suggested)
- Home — sections in `ui_kits/marketing/Sections.jsx`
- Platform, Regulations, Developers, Pricing, Security (stub pages, same nav/footer)
- Public passport viewer — `photonictag.eu/p/<sku>` — the `ui_kits/passport_viewer/` reference, ported as a mobile-first SSR route. Must work offline after first view.

### App (React / Remix suggested)
- Auth with SSO (SAML + OIDC)
- Roles: Admin, Editor, Reviewer, Auditor (read-only), Supplier (scoped)
- **Dashboard** — stats + activity feed
- **Passports catalog** — table in `ui_kits/app/Catalog.jsx` · bulk actions, filters, import CSV, search (cmd-K)
- **Passport editor** — *not yet in the kit.* Build using the editor preview shown in `preview/comp-passport.html` as the canonical surface. Tabs: Overview, Materials, Supply chain, Recyclability, Compliance, Audit log. Inline edit, versioning, diff view, publish flow.
- **Suppliers** — invite, scope, track pending fields
- **Regulations** — live list with enforcement dates (see Regulation grid in marketing)
- **Audit log** — per-passport immutable hash-chained events (see Feature split in marketing for the visual contract)
- **Filings** — export signed PDF for market surveillance
- **API keys + Webhooks** — developer surface

### Backend contracts
- `Passport` · sku, gtin, version, state, materials[], suppliers[], substances[], recyclability_grade, regulation_ids[]
- `AuditEvent` · passport_id, actor, action, field, old, new, ts, hash, prev_hash
- `Supplier` · id, tier (T1–T4), country, certifications[]
- `Regulation` · id, name, enforcement_date, jurisdiction, fields_required[]
- `Timestamp` · eIDAS QTSP integration (Buypass, GlobalSign, D-Trust)

### Non-negotiables (from `README.md`)
- **Three colors only.** Yellow `#FFDF00`, ink `#000000`, paper `#FFFFFF`. Neutrals are alphas of ink/paper. **No grays. No blue. No green. No red.** State is communicated via position + mono label + pill, not hue.
- **Sharp corners.** 2px on buttons/inputs/cards, 0px on structural panels. Pill is reserved for status dots only.
- **Hairlines, not shadows.** 1px `--hairline` (ink-12) is the workhorse divider. Shadows appear only via the four `--lift-*` tokens, and only on lifted surfaces.
- **Mono type is load-bearing.** Geist Mono for every SKU, GTIN, hash, timestamp, version, regulation ID.
- **Voice.** Sentence case, no emoji, specific numbers, precise regulation names. See `README.md` > Content fundamentals.
- **Hit targets.** 44px minimum on mobile. 24px minimum text on slides. 12pt minimum for print exports.
- **Motion.** Subtle — 120/200/320ms with `--ease`. Respect `prefers-reduced-motion`.

## Font substitution status

| Family | Current | Target | Action |
|---|---|---|---|
| Sans / Display | Geist (Google Fonts `@import`) | Geist | Install `geist` npm package; swap `@import` in `fonts/fonts.css` for local WOFF2 |
| Mono | Geist Mono (Google Fonts `@import`) | Geist Mono | Same — bundled in the same package |

The `fonts/fonts.css` file already has guidance comments for the swap.

## Open questions worth resolving before ship

1. Dark-mode spec — the system is dark-surface-comfortable (sidebar, hero, audit log are all on ink) but does not yet ship a `prefers-color-scheme: dark` swap for marketing/viewer routes. Decide whether dark mode is automatic or per-surface.
2. A real photo / illustration direction — the kit ships zero imagery. Solid `--ink` blocks with hatching are placeholders. Decide whether the brand uses studio product photography, flat illustrations, or stays purely typographic.
3. QR rendering library — kit uses a CSS conic-gradient mock. Pick a real generator (`qrcode`, `qr-code-styling`) and wire it to `passport_url`.
4. Final logo sign-off — the stamp-within-a-stamp mark in `assets/` is locked to ratio but not yet signed off by a brand designer. Treat as v1.

## How to start a Claude Code build session

Point Claude Code at this project folder and say something like:

> Read SKILL.md and HANDOFF.md. Build the marketing site as a Next.js 15 app (App Router) using the tokens in colors_and_type.css. Port ui_kits/marketing/Sections.jsx components to RSC where possible, client components only where interactivity requires it. Use lucide-react for icons. First deliverable: Home page at pixel parity with ui_kits/marketing/index.html.

Then, separately:

> Build the app at ui_kits/app/index.html as a React + Vite app with tanstack/router and tanstack/query. Use shadcn/ui primitives as a base layer, but override with our tokens (zero default radii, hairline borders, no shadows except --lift-* tiers). First deliverable: Catalog page with the DataTable from ui_kits/app/Catalog.jsx, wired to a mock /api/passports endpoint.

And for the public viewer:

> Port ui_kits/passport_viewer/Viewer.jsx to a Next.js dynamic route at /p/[sku]. Mobile-first, SSR. Use lucide-react for icons. Render a real QR code from `next/og` linking to the canonical viewer URL. First deliverable: route renders TX-0448-B at parity with the iOS-framed reference.
