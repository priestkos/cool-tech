# UI SDK Behavior Lab

Local offline lab demonstrating a **clean-room recreation** of [Vercel UI SDK](https://ui-sdk.dev)–style interaction behaviors (popup, selection, typeahead, dismiss, sortable + live region). This is **not** the official SDK.

## Commands

```bash
cd apps/ui-sdk-behavior-lab
bun install
bun run dev      # http://localhost:5173
bun test
bun run typecheck
bun run build
```

## Architecture

- `src/behaviors/` — small state helpers and hooks (no `@ui-sdk/*`, no copied `vercel-labs/ui` source)
- `src/widgets/` — composed combobox + sortable list
- `src/lab/` — behavior picker, ARIA inspector, keyboard walkthrough, agent recipe panel

## Credit & provenance

| Resource | Link |
|----------|------|
| UI SDK site | https://ui-sdk.dev |
| Upstream repo | https://github.com/vercel-labs/ui (Apache-2.0, Copyright 2026 Vercel, Inc.) |
| Launch post | https://x.com/vercel/status/2120950020249895314 |
| Eligible doc snapshot (credit only) | `26ac6b3441335614cb413b54e56a9f9b0ff70f15` |

Every `@ui-sdk/*` npm version at lab launch was **younger than 72h**; this demo intentionally does **not** install `@ui-sdk/core`, `@ui-sdk/react`, or vendored upstream source. See `dependency-evidence.json`.

**Deferred:** swap to `@ui-sdk/core@0.1.0-beta.1` after ~**2026-11-15 10:42 PM IST** once eligible and re-audited.

## shadcn / registry

UI chrome uses pinned shadcn 4.22.1 + Base UI components. Registry reference commit: `shadcn-ui/ui@8a3536678a528cc012b9e62484290e79d0be410f` (MIT / project licenses apply to copied registry files).
