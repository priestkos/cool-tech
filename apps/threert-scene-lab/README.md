# ThreeRT Scene Lab

Browser lab that builds scenes with the official [`@threert/scene`](https://www.npmjs.com/package/@threert/scene/v/0.1.1) package (physical lux / cd / nits) and previews them with real **three.js** rasterization. Hardware path tracing remains in ThreeRT’s native clients, not in this Vite app.

## Upstream pin

| Artifact | Pin |
|----------|-----|
| npm | `@threert/scene@0.1.1` (published 2026-11-13T00:35:32Z) |
| Git | [meshy-dev/ThreeRT](https://github.com/meshy-dev/ThreeRT) @ `1aae0b7f81a5ba6a4491bc624baf4a5799ffb060` |
| License | MIT — see `THIRD_PARTY_LICENSES/threert-scene-MIT.txt` |

## What changed (remake)

- Replaced the clean-room schema with lab JSON **v2** that compiles through `buildThreertScene()` using `@threert/scene` types (`DirectionalLight`, `SkyAtmosphere`, `PointLight`, `SpotLight`, `MeshStandardMaterial`, …).
- Physical panel calls upstream `lightDesc()` on built lights.
- Tests use `RecordingEngine` and `SceneBinding` from the package.
- Browser preview mirrors the built graph into **three.js** (upstream README: same scene code, raster path in any browser).

## Commands

```bash
cd apps/threert-scene-lab
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

Production build (Nov 2026): main JS gzip **~278 kB** (`dist/assets/index-*.js`).

## Architecture

| Area | Role |
|------|------|
| `src/features/scene/document.ts` | Lab JSON v2 validation |
| `src/features/scene/build.ts` | Build `@threert/scene` `Scene` + camera |
| `src/features/scene/three-preview.ts` | Mirror graph → three.js WebGL |
| `src/features/scene/physical.ts` | Readouts via `lightDesc()` |
| `src/features/scene/samples.ts` | Five sample documents |
| `src/features/lab/*` | Editor, gallery, units, compare UI |

## Credit

- [ThreeRT](https://threert.dev) · [GitHub](https://github.com/meshy-dev/ThreeRT) (MIT)
- [npm @threert/scene@0.1.1](https://www.npmjs.com/package/@threert/scene/v/0.1.1)
- [Launch post](https://x.com/ThreeRT3D/status/2121238880808829385)

Other MIT dependencies retain notices under `node_modules/` and `dependency-evidence.json`.