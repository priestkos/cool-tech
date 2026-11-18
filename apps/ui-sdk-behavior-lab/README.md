# UI SDK Behavior Lab

Local offline lab using the **real** [Vercel UI SDK](https://ui-sdk.dev) npm packages pinned at **`0.1.0-beta.2`** (Apache-2.0): `@ui-sdk/core`, `@ui-sdk/react`, and `@ui-sdk/web`. It demonstrates popup, selection, typeahead, dismiss, sortable helpers, and live announcements, with ARIA inspection and a Base UI combobox reference column.

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

- `src/lab/` — behavior picker, ARIA inspector, keyboard walkthrough, agent recipe panel
- `src/widgets/` — `@ui-sdk/react` combobox, Base UI reference combobox, sortable task list
- `src/behaviors/` — unit tests against `@ui-sdk/core` foundation APIs (+ local ARIA inspector helpers)
- Lab chrome — pinned shadcn 4.22.1 minimalist (not part of upstream)

## Upstream pin

| Package | Version | Published (UTC) |
|---------|---------|-----------------|
| `@ui-sdk/core` | `0.1.0-beta.2` | 2026-11-13T13:05:20.558Z |
| `@ui-sdk/react` | `0.1.0-beta.2` | 2026-11-13T13:04:27.623Z |
| `@ui-sdk/web` | `0.1.0-beta.2` | 2026-11-13T13:05:27.702Z |

Eligible git snapshot: `220c1a0d7278872286a620a8e4ee4210ca46f9bd`.

## Credit & license

| Resource | Link |
|----------|------|
| UI SDK site | https://ui-sdk.dev |
| Upstream repo | https://github.com/vercel-labs/ui |
| License | Apache-2.0 — see `THIRD_PARTY_LICENSES/ui-sdk-LICENSE.txt` |

shadcn registry reference commit: `shadcn-ui/ui@8a3536678a528cc012b9e62484290e79d0be410f`.

Dependency age evidence: `dependency-evidence.json`.