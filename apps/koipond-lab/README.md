# Koipond Lab

Offline playground for the real [**@hxlfed/koipond**](https://www.npmjs.com/package/@hxlfed/koipond) **0.1.0** React pond (MIT). This cool-tech demo is **not** affiliated with the upstream project.

## Commands

```bash
cd apps/koipond-lab
bun install
bun run dev      # http://localhost:5173
bun test
bun run typecheck
bun run build    # report dist/assets/*.js gzip in build output
```

## Architecture

- **Full-viewport** `<KoiPond />` from npm (not a registry copy from git `main`, not a lookalike shader).
- **Look picker** — all keys exported in `LOOKS` for 0.1.0.
- **Props panel** — documented defaults (`fish` 12, `fishSize` 0.18, `rain` 0.4, `seed` 7, etc.).
- **Feed tab** — `pondRef.current?.feed(x, y)` with 0–1 coordinates; double-tap / long-press on the pond still works upstream.
- **Hero embed** — second live instance with headline overlay (README-style band).

Peer: `three@0.187.0` (bundled locally — no runtime CDN).

## Provenance

| Package | Version | Published (UTC) |
|---------|---------|-----------------|
| @hxlfed/koipond | 0.1.0 | 2026-11-21T06:11:56.314Z |
| three | 0.187.0 | 2026-10-30T08:09:24.504Z |

npm `gitHead` for 0.1.0: `a1479c597ac3ca551dfa5231dc58729c632c4d0d`.  
Age cutoff (launch − 72h): `2026-11-21T11:04:15Z`. See `dependency-evidence.json` for direct deps.

## Credits

- Upstream: https://github.com/Himanshu-Sangshetti/koipond  
- Launch post: https://x.com/himanshutwtxs/status/2124024110196138061  
- Reference demo (not loaded at runtime): https://koipond-demo.vercel.app  

Copyright (c) 2026 koipond contributors — MIT (see `THIRD_PARTY_LICENSES.md` and About in the app).

WebGL2 is required for full water; the component’s own fallback applies otherwise. Simulation pauses off-screen; `prefers-reduced-motion` shows a still frame per upstream behaviour.