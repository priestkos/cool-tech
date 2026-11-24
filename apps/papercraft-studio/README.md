# Papercraft Studio

Local offline studio around the **real** [xikhar/papercraft](https://github.com/xikhar/papercraft) pop-up skill (MIT), pinned to commit [`57c4c93a1f3b2743066b6ed41094d1bcbb69c3b5`](https://github.com/xikhar/papercraft/tree/57c4c93a1f3b2743066b6ed41094d1bcbb69c3b5). This demo is independent—not official papercraft.

The bundled **countryside** worked example runs in the official 3D and 2D harnesses. Studio chrome adds palette switching, fold-rise scrubbing, tilt-shift, paper sound mute, mode toggle, and PNG export via `window.__papercraft`.

## Commands

```bash
cd apps/papercraft-studio
bun install
bun run dev
bun run typecheck
bun run build
bun test
bun run preview
```

Production UI bundle (Vite report): ~87 kB gzipped for React chrome; vendored countryside + paperkit ship as static assets under `public/papercraft/` (much larger).

## Architecture

- **React shell** — shadcn minimalist controls.
- **Iframe** — `/papercraft/studio/view-3d.html` or `view-2d.html` with local import maps (`three@0.187.0` from `public/three/`, `papercraft/` → vendored assets).
- **Studio scenes** — remount countryside colours from `palettes.json`; harness files only add `sound` and `setOpen` on `__papercraft` (allowed hook).

Sources were vendored from git at the pin above—not `npx skills add`, not the unrelated npm `papercraft` package, not jsDelivr.

## Credits

- Papercraft © 2026 Shikhar — [MIT](THIRD_PARTY_LICENSES)
- Launch: https://x.com/xikhar/status/2124565795003105494

WebGL2 is required for the 3D PaperPost lens; use 2D mode otherwise. Audio requires a pointer or key gesture (`PaperSound.unlock()` in the harness).