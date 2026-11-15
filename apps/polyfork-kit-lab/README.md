# Polyfork Kit Lab

Demo lab for [Polyfork](https://polyfork.dev): browse the public [catalog index](https://github.com/lucas-martinic/polyfork-catalog), preview low-poly models in **three.js**, tune `createAsset` knobs, and compose simple kit scenes.

**Licensing (summary):** Free mesh files may be used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) or Polyfork’s no-attribution terms ([full text](https://polyfork.dev/licensing)). ES module (`.mjs`) source is **not** redistributed by this repo — live parametric mode loads modules from the official Polyfork CDN only.

Inspiration: [source post](https://x.com/songsong/status/2121055884294185400).

## Commands

```bash
cd apps/polyfork-kit-lab
bun install
bun run dev      # http://localhost:5173
bun test
bun run typecheck
bun run build
bun run preview
```

## Architecture

| Mode | Network | Preview |
|------|---------|---------|
| **Offline (default)** | Local catalog snapshot + placeholders | Placeholder mesh; mock parametric uses local stand-in (not Polyfork source) |
| **Live Polyfork CDN** | `polyfork.dev` only | Static GLB and/or CDN `createAsset` modules |

- Catalog snapshot: commit `2232f7df96e44517e4f9b2d08df1081a4a3780e7` (2026-11-11) of `polyfork-catalog`.
- Sample offline params: `public/data/a-frame-cabin-6cb550-params.json`.
- Snippet panel shows CDN import line and optional `npx polyfork@0.1.1 add <id>` (CLI not installed in-app).

## Credit

- [Polyfork](https://polyfork.dev)
- [polyfork-catalog](https://github.com/lucas-martinic/polyfork-catalog)
- [Licensing](https://polyfork.dev/licensing)

No Polyfork `.mjs` files are committed to this repository.