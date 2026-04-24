---
name: photonictag-design-coder
description: >-
  PhotonicTag design system — three colors (ink, paper, yellow), Geist fonts,
  hairlines not shadows, mono for IDs. Use when editing client/, Tailwind tokens,
  design-system package, public scan, landing, or brand components.
---

# PhotonicTag design coder

## Source of truth

- Canonical tokens live in the **PhotonicTag `design-system/` package** (sibling folder in the Pg-cursor workspace, or add as a submodule): `colors_and_type.css`, `HANDOFF.md`.
- This app maps tokens through [`client/src/index.css`](../../../client/src/index.css) and [`tailwind.config.ts`](../../../tailwind.config.ts).

## Rules

1. **Three colors** — Yellow `#FFDF00` (brand), ink, paper. Neutrals are alpha blends, not named grays.
2. **Mono is load-bearing** — SKUs, GTINs, hashes, ISO dates → `font-mono` / `var(--font-mono)`.
3. **Sharp UI** — Prefer hairline borders over drop shadows for structure.
4. **Lucide** — Use `lucide-react` for icons; match stroke weight to the rest of the UI.

## Brand primitives

Reuse [`client/src/components/brand/`](../../../client/src/components/brand/) (`brand.tsx`, `icon.tsx`, `public-nav-v2.tsx`) before inventing new button styles.

## Check

- `npm run check`
- Spot-check `/v2`, `/product/:id` (public scan), and one authenticated page for visual consistency.
