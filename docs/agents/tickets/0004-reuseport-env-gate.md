# Ticket #0004 — Make `reusePort` opt-in (Windows dev unblock)

**Status:** open
**Assignee:** Architect (small fix; no need for an agent)
**Created:** 2026-04-23
**Source of report:** Coder agent on ticket #0003 (Brief 2026-17 opportunity #2)

## Problem

`server/index.ts:359` calls:

```ts
httpServer.listen({
  host: "0.0.0.0",
  port,
  reusePort: true,
});
```

`reusePort: true` maps to libuv's `SO_REUSEPORT`. On **Windows + Node 24** this throws `ENOTSUP` on IPv4 wildcards. Linux (and CI) is unaffected because `SO_REUSEPORT` works there. Result: any Windows dev hitting `npm run dev` for the first time gets:

```
Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:5000
```

The Coder agent on ticket #0003 worked around this for E2E tests via `tests/e2e/.win-listen-shim.cjs` (a NODE_OPTIONS preload that strips `reusePort` before libuv sees it). The shim is acceptable test-only infrastructure but the underlying bug should be fixed so the workaround can be deleted.

## Fix (one line)

```ts
// server/index.ts:359
httpServer.listen({
  host: "0.0.0.0",
  port,
  reusePort: process.env.PORT_REUSE === "1" || process.platform === "linux",
});
```

`reusePort` is genuinely useful in production for graceful zero-downtime restarts (multiple processes can bind the same port). Default behaviour:
- **Linux**: opt-in by default (the platform supports it; Fly deploys use this)
- **Windows / Darwin**: off by default
- **Override**: `PORT_REUSE=1` forces on, `PORT_REUSE=0` forces off

## Acceptance criteria

- `server/index.ts` updated as above
- `tests/e2e/.win-listen-shim.cjs` deleted
- `playwright.config.ts` updated if it referenced the shim (it didn't — was opt-in via NODE_OPTIONS only)
- `npm run dev` starts cleanly on Windows + Node 24 with no NODE_OPTIONS preload
- `npm run check` clean
- All 127 unit tests + 8 new E2E tests still green

## Out of scope

- Refactoring the rest of the boot sequence
- Adding a "fallback to a different port if 5000 is in use" feature
- Documenting the env var in README (one-line behaviour, comment-in-code is enough)
