# Dissolve Dust Lab

Offline gallery for the **real** dissolve-ui web registry (`engine.ts`, scratch card, toast, swipe-to-delete, glossy/like buttons) at npm **`dissolve-ui@0.0.6`** / Git commit [`06eddec`](https://github.com/dissolve-ui/dissolve/commit/06eddec11725e5874eafce69e97d10cca0f7f882). Components were copied with the pinned CLI (`bunx dissolve-ui@0.0.6 init --web` + `add …`), not from a live registry.

Independent demo for [cool-tech](https://github.com/priestkos/cool-tech); not official dissolve-ui.

## Commands

```bash
cd apps/dissolve-dust-lab
bun install
bun run dev      # http://localhost:5173
bun run test
bun run typecheck
bun run build
```

Production build (Nov 2026): main JS **~140 kB gzip** (Vite report).

## Architecture

- **Lab chrome:** Vite + React 19 + shadcn minimalist (`components/ui`).
- **Dissolve:** vendored sources under `src/components/dissolve/` from 0.0.6 `registry/web` (canvas `play()`, dust preset, DOM `capture()`).
- **Slices:** gallery (scratch, swipe, buttons), toast + Undo, playground sliders → `play({ grain, duration, direction })`.

## Credits

MIT **Copyright (c) 2026 Rayan Selmi** — see [THIRD_PARTY_LICENSES](./THIRD_PARTY_LICENSES).

- Repo: https://github.com/dissolve-ui/dissolve (formerly https://github.com/rs-4/dissolve)
- npm: https://www.npmjs.com/package/dissolve-ui/v/0.0.6
- Site: https://dissolve.rselmi.com
- Launch post: https://x.com/rsStats_/status/2124194035703398830

Provenance details: `dependency-evidence.json`.