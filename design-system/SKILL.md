---
name: photonictag-design
description: Use this skill to generate well-branded interfaces and assets for PhotonicTag, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

Key files:
- `colors_and_type.css` — drop-in CSS custom properties for the whole system
- `fonts/fonts.css` — webfont imports
- `assets/` — logo marks and wordmarks (gold-amber on ink)
- `ui_kits/_shared/Primitives.jsx` — `Button`, `Badge`, `Icon`, `PassportCardMini`, etc.
- `ui_kits/marketing/`, `ui_kits/app/` — reference implementations to copy from

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Include both stylesheets:

```html
<link rel="stylesheet" href="fonts/fonts.css">
<link rel="stylesheet" href="colors_and_type.css">
```

If working on production code, copy assets and read the rules in `README.md` to become an expert in designing with this brand. Follow the voice rules strictly — PhotonicTag is a compliance product and reads like one.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask clarifying questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
