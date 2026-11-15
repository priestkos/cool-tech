# Polyfork Kit Lab — plan

## Goal

Bun + Vite React lab that browses the public Polyfork catalog, previews models in three.js, drives `createAsset` knobs, and composes kit scenes — defaulting to an offline snapshot with placeholder meshes.

## Single-user MVP

- One local user, no accounts, no API keys in the app.
- Offline-by-default: pinned `catalog.json` snapshot, local param schema samples, placeholder primitives.
- Optional **Live Polyfork CDN** mode: GLB + parametric `.mjs` from `polyfork.dev` only (never vendored).

**Out of scope:** Redistributing Polyfork `.mjs` source, HD editions, private kits, `polyfork` CLI as a dependency, multi-user sync, deploy.

## Vertical slices

1. **Kit browser + preview** — Search/filter kits and types, select asset, three.js orbit preview (placeholder default).
2. **Knobs + mesh modes** — Schema → controls, toggle placeholder / mock parametric (offline) vs GLB / CDN parametric (live) with load timing.
3. **Composer + snippet** — Place/move/rotate parts on a grid; copy import line and `npx polyfork@0.1.1 add <id>`.

## Stack

| Piece | Why |
|-------|-----|
| Bun + Vite 8.3.5 | Monorepo demo convention |
| React 19 + TS 6 | Proven sibling pins |
| three@0.187.0 | GLB + placeholders + CDN parametric via import map |
| shadcn base-mira | Lab chrome reused from sibling demos |

## Testing

- Unit: catalog filter, knob schema, modes/network guard, composer, snippets.
- `bun test`, `bun run typecheck`, `bun run build` (offline).
- Browser smoke desktop/mobile, screenshot + interaction video for PR.

## Deferred

- Bundled GLB samples, full params.json for every asset offline, @react-three/fiber, WebGPU, Cloudflare deploy.