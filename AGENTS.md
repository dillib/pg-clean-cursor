# PhotonicTag — Cursor build (`pg-clean-cursor`)

**GitHub:** [https://github.com/dillib/pg-clean-cursor](https://github.com/dillib/pg-clean-cursor)

This repository is the **PhotonicTag app root** (Node + Vite + Drizzle). Cursor project skills live under [`.cursor/skills/`](.cursor/skills/).

## How to use

1. Clone this repo; open the folder in Cursor.
2. For a task, mention: *"Follow `.cursor/skills/<name>/SKILL.md`."*
3. For test-only tickets, use [`docs/agents/coder-ticket-template.md`](docs/agents/coder-ticket-template.md).

## Agent roster

| Skill | Role | When to invoke |
|-------|------|----------------|
| `photonictag-trust-coder` | Auth, tenancy, exports, secrets | `server/`, `shared/models/auth.ts`, middleware |
| `photonictag-design-coder` | Tokens, Tailwind, brand UI | `client/`, `tailwind.config.ts` |
| `photonictag-ticket-writer` | Small Coder tickets | Splitting work / coverage tickets |

## Docs

- [`PLAN.md`](PLAN.md), [`AUDIT.md`](AUDIT.md) — security / tenancy roadmap  
- **Design system** (tokens + HANDOFF): keep a sibling checkout `../design-system` from the main PhotonicTag design repo, or add as a git submodule when you publish it separately.

## Run locally

```bash
npm install
npm run dev
```

## Remotes

- **`pg-clean-cursor`** → this GitHub repo (`main`). Push: `git push pg-clean-cursor main`.
- **`origin`** may still point at the legacy `ptgreplit` line — keep both until you cut over.
