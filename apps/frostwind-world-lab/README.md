# Frostwind World Lab

Offline browser lab for the real [Frostwind](https://github.com/trinity-works/frostwind) world compiler (MIT, Trinity Labs). Biome picker, scale authority table, and deterministic seed compile / re-render.

**Upstream pin:** `537ed51d215096df54ab45770f4f811481a2986b`  
**Independent demo** — not affiliated with Trinity Labs.

## Commands

```bash
cd apps/frostwind-world-lab
bun install
bun run dev
bun run test
bun run typecheck
bun run build
```

## Architecture

- Vendored Frostwind `src/` at the pinned commit; `FrostwoodWorld` GPU pipeline from `render.js`.
- Local security patch over upstream `537ed51`: `vendor/frostwind/src/main.js` `boom()` uses DOM APIs instead of `innerHTML` (CodeQL).
- React + shadcn minimalist chrome; compile runs in-browser (WebGL), no runtime network.
- Scale rows from `scale.js` and `body-deer.js` (`measureDeer`, `northBuck.bodyLengthM`).

## Credits

- https://github.com/trinity-works/frostwind (commit `537ed51d215096df54ab45770f4f811481a2986b`)
- https://project-frostwind.fly.dev/
- https://x.com/marnold_mch/status/2123416870808363492
- Copyright (c) 2026 Trinity Labs Pte. Ltd. — MIT (see `THIRD_PARTY_LICENSES.md` and `vendor/frostwind/LICENSE`)