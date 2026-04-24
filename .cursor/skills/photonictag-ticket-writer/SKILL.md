---
name: photonictag-ticket-writer
description: >-
  Writes small, reviewable Coder tickets for PhotonicTag (one endpoint or one PR
  each). Use when splitting work, adding test coverage tickets, or when the user
  asks for tickets, backlog items, or agent tasks.
---

# PhotonicTag ticket writer

## Template

Copy [`docs/agents/coder-ticket-template.md`](../../../docs/agents/coder-ticket-template.md).

## Required fields

- **Endpoint** — method, path, file:line, auth, storage deps
- **Behaviours** — trigger → expected (numbered)
- **Acceptance** — exact `npm run …` command that proves done
- **Out of scope** — explicit list

## Naming

- Save tickets under `docs/agents/tickets/` as `NNNN-short-slug.md` with zero-padded sequence.
