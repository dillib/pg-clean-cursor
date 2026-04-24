# photonictag — Design System

This folder is the single source of truth for the photonictag brand.
Drop it into the root of any repo as `design-system/` and point Claude Code at it.

## Quick start for Claude Code

```
Read design-system/HANDOFF.md and design-system/SKILL.md first.
Then port design-system/ui_kits/<marketing|app|passport_viewer>/ into
<your stack — Next.js / Vite / Remix / etc.>.

Non-negotiables:
  - Three colors only: ink (#000), paper (#FFF), yellow (#FFDF00).
    Every other neutral is ink or paper + alpha.
  - Sharp corners. No border-radius except on photographic imagery.
  - Hairlines (1px solid var(--hairline)), never box-shadows.
  - Geist Sans for UI, Geist Mono is load-bearing for SKUs, GTINs,
    hashes, timestamps, IDs, percentages.
  - 44px minimum touch targets. `prefers-reduced-motion` must be honored.
```

## What's in here

| Path | What it is |
|---|---|
| `README.md` | The full design-system doc — read this first for context |
| `HANDOFF.md` | Step-by-step integration playbook (this is for devs) |
| `SKILL.md` | Compact rulebook for any AI working on this brand |
| `colors_and_type.css` | **The tokens.** Import this at the root of your app |
| `fonts/fonts.css` | Geist + Geist Mono loader (swap to local in production) |
| `assets/` | Logos (SVG), brand marks — use as-is |
| `ui_kits/_shared/` | `Primitives.jsx` (Button, Badge, Mono, Icon, BrandMark, Wordmark) + `Motion.jsx` (Tilt, Reveal, Marquee) |
| `ui_kits/marketing/` | Marketing site reference — nav, sections, hero canvas |
| `ui_kits/app/` | Authenticated product shell — sidebar, catalog |
| `ui_kits/passport_viewer/` | Public passport viewer — mobile-first |

## Integration order

1. **Tokens first.** `@import` `colors_and_type.css` into your app's root
   stylesheet. Replace every hard-coded `#FFDF00` / `#000` / `#FFF` with
   the CSS variables. Don't proceed until this is clean.
2. **Fonts.** Use `fonts/fonts.css` in dev; swap to local Geist files
   (available via `npm i geist`) before shipping.
3. **Primitives.** Port `ui_kits/_shared/Primitives.jsx` into your
   component library. Keep prop shapes identical so these reference
   kits remain a useful spec.
4. **Screens.** Port section-by-section. The kit compositions are
   reference layouts — your real screens pull data from your API.

## Notes

- The UI kit files are plain React + Babel (no bundler). They're
  intentionally portable. When porting to Next.js / Vite, paste
  components into `.tsx` files and add `'use client'` where needed.
- `ui_kits/marketing/LiveStamp.jsx` is the hero canvas animation —
  pure Canvas 2D, no dependencies. Drops straight into a client
  component.
- Nothing in this folder should be edited ad-hoc in product code.
  If a token, primitive, or composition needs to change, change it
  here and propagate — or open a design-system PR.
