# Panelo Agent Dashboard

Offline lab around the **real** Panelo Home Care Schedule (`dashboard-pages/thirteen`), two free charts, fixture workflows, and the pinned `createAgent` / `useAgentChat().play()` bridge.

## Commands

```bash
cd apps/panelo-agent-dashboard
bun install
bun run dev      # Vite dev server
bun run test
bun run typecheck
bun run build
bun run preview
bun run agecheck # lockfile npm publish vs 72h cutoff
```

## Architecture

- Vendored MIT source from [paneloui](https://github.com/raycanvas-ai/paneloui) commit `6517e2e7062f97501e46e73ba1e545f19ef556e2` (not live shadcn `@panelo` or current `main`).
- `@ui-sdk/core@0.1.0-beta.2` and `@ui-sdk/react@0.1.0-beta.2` from npm (exact pins).
- Lab chrome: workflow table, scripted agent panel, permissions switch, action log.
- System font stack — no Google Fonts at runtime.

## Credits

- [Panelo / Raycanvas](https://github.com/raycanvas-ai/paneloui) — MIT, Copyright (c) 2026 Panelo
- [UI SDK](https://ui-sdk.dev) / [vercel-labs/ui](https://github.com/vercel-labs/ui) — Apache-2.0, Copyright 2026 Vercel, Inc.
- Launch: https://x.com/shadcnlabs/status/2125221634101723255

Independent demo — not official. Pro dashboard pages are not in the repository.