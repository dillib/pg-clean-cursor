# PhotonicTag — Design System

A minimal, editorial design system for a B2B SaaS that issues EU Digital Product Passports. Three colors. One typeface family. Evidence-first layouts.

---

## TL;DR

| Axis | Decision |
|---|---|
| **Color** | Yellow `#FFDF00` + Black `#000000` + White `#FFFFFF`. Neutrals are black/white with alpha. **No grays.** |
| **Type** | Geist (display + body) + Geist Mono. Variable weights 100–900. |
| **Radii** | Sharp: 0, 2, 4, 6px + pill. 2px is the default. |
| **Elevation** | Hairlines, not shadows. Yellow never shadows. |
| **Voice** | Sentence case. Specific numbers. Mono for every ID, hash, time, version. |

---

## The three colors

- **`--yellow` · `#FFDF00`** — the one accent. Used for CTAs, brand marks, live-state pills, selection. Never for body copy. Never gradient'd.
- **`--ink` · `#000000`** — fg, and neutral scale built from its alpha (`ink-04` through `ink-90`).
- **`--paper` · `#FFFFFF`** — bg, and tint scale built from its alpha (`paper-04` through `paper-90`) for use on ink.

That's it. No blue. No green. No red. State is communicated with **position + mono label + pill shape**, not hue.

---

## Fonts

Geist and Geist Mono (SIL OFL 1.1). Currently loaded from Google Fonts in `fonts/fonts.css`. For production, swap the `@import` for local paths (e.g. `/fonts/geist/*.woff2` via the `geist` npm package you have installed).

```
--font-sans:    'Geist', ...
--font-display: 'Geist', ...        /* same family, heavier weight at size */
--font-mono:    'Geist Mono', ...
```

Mono is **load-bearing**: every SKU, GTIN, hash, timestamp, version, and regulation ID uses it.

---

## Content fundamentals

- **Sentence case only**, including buttons and nav. Never Title Case.
- **Specific numbers** always beat adjectives. "14,204 passports" beats "many passports".
- **Name the regulation exactly** — "ESPR · 2024/1781", not "new EU rules".
- **No emoji.** No decorative icons. Icons exist for navigation and affordance only.
- **Dates as ISO** in mono: `2026-07-01`. Relative time in sans: `2h ago`.

---

## Visual foundations

- **Sharp corners** default. 2px radius on buttons, inputs, cards. 0px on panels and structural containers.
- **Hairlines carry the system.** 1px `ink-12` dividers. Shadows appear only for lifted surfaces (`--lift-2`, `--lift-3`) — never as decoration.
- **Yellow is a stamp, not a gradient.** Flat fill only.
- **Mono-as-rhythm:** tables, logs, and headers mix Geist (labels) with Geist Mono (values) for a technical editorial feel.

---

## Iconography

Hand-drawn, stroke-based, 24×24 viewBox, 1.75px stroke. All icons live in `ui_kits/_shared/Primitives.jsx` under `<Icon name="..."/>`. For production, swap to `lucide-react` — the shape language matches.

Icons inherit `currentColor`. Never filled, never colored outside ink or yellow.

---

## File map

```
/colors_and_type.css         ← all tokens
/fonts/fonts.css             ← Geist + Geist Mono @import
/assets/                     ← logomarks (mark, wordmark, light/dark)
/preview/                    ← specimen cards for tokens + components
/ui_kits/_shared/Primitives.jsx
/ui_kits/marketing/          ← black-first marketing site
/ui_kits/app/                ← app dashboard (catalog + editor)
/ui_kits/passport_viewer/    ← public mobile passport surface
/HANDOFF.md                  ← developer handoff brief
/SKILL.md                    ← skill prompt for future design work
```
