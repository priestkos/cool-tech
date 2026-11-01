# Spark Radix Explorer

**Unofficial demo. Not affiliated with World Labs or the Spark team.**

One-page viewer for [@sparkjsdev/radix](https://github.com/sparkjsdev/radix) (`@sparkjsdev/radix@0.0.1`, MIT, © 2026 World Labs Technologies, Inc.): pick a CC0 Gaussian-splat sample or drop your own `.ply` / `.spz`, orbit or fly through the scene, and watch live stats (splat count, CPU frame time, GPU backend).

Buzz: [Spark on X](https://x.com/sparkjsdev/status/2115852543708536881) · Code: [github.com/sparkjsdev/radix](https://github.com/sparkjsdev/radix) · npm: [@sparkjsdev/radix](https://www.npmjs.com/package/@sparkjsdev/radix)

## Run

```bash
cd apps/spark-radix-explorer
bun install
bun run dev
```

Open the printed local URL in a **WebGPU-capable browser** (Chrome/Edge recent). Radix uses three.js `WebGPURenderer`; when WebGPU is unavailable it falls back to the WebGL2 backend (`webgpu-gl`). The stats panel labels the active backend from `getGpuCaps(renderer).backend`.

## Controls

| Input | Orbit | Fly |
| --- | --- | --- |
| Mouse drag | Orbit | Look |
| Scroll | Zoom | — |
| Right-drag | Pan | — |
| WASD | — | Move |
| Shift / Ctrl | — | Fast / slow |
| Tab (default mode key) | Toggle orbit ↔ fly | |

Use **Flip Y** when a capture looks upside-down (many splats are stored y-down). **Reset view** restores the default camera.

## Files

- **Supported:** `.ply`, `.spz` (and compressed PLY as decoded by Radix), up to **200 MB**.
- **Unsupported types** show a readable toast error.
- Drag-and-drop anywhere on the page, or **Open .ply / .spz**.

## Samples

| Scene | Source | License |
| --- | --- | --- |
| Sparkling water | Vendored from [raymondyfei/SharedTestModels](https://github.com/raymondyfei/SharedTestModels) @ `92aec941` | CC0 1.0 (`THIRD_PARTY_LICENSES/SharedTestModels-CC0-LICENSE.txt`) |
| A cute cat | Same repo (offline in `public/samples/`) | CC0 1.0 |
| Seashell / Scarf | Streamed from Radix’s public sample host (`storage.googleapis.com/forge-dev-public/...`) | CC0 1.0 (same model set); requires network |

We do **not** use sparkjs.dev-hosted splats (no license stated there).

## Pinned versions (publish time, UTC)

Verified with `npm view <pkg>@<ver> time --json` before install (72-hour `minimumReleaseAge` in `bunfig.toml`).

| Package | Version | Published (UTC) |
| --- | --- | --- |
| `@sparkjsdev/radix` | 0.0.1 | 2026-10-29T04:07:36Z |
| `three` | 0.186.0 | 2026-09-08T19:25:22Z |
| `@types/three` | 0.186.0 | 2026-09-11T18:07:29Z |
| `vite` | 8.3.5 | 2026-10-21T06:38:54Z |
| `@vitejs/plugin-react` | 6.1.2 | 2026-10-05T10:08:27Z |
| `typescript` | 6.0.3 | 2026-04-16T23:38:27Z |
| `react` / `react-dom` | 19.3.1 | 2026-10-14T16:47–49Z |
| `@types/react` / `@types/react-dom` | 19.3.0 | 2026-09-09T18:07–08Z |
| `tailwindcss` / `@tailwindcss/vite` | 4.3.3 | 2026-07-16T12:03–04Z |
| `shadcn` (CLI) | 4.22.1 | 2026-10-18T18:12:18Z |
| `lucide-react` | 1.61.0 | 2026-10-21T06:12:38Z |
| `@types/bun` | 1.4.4 | 2026-10-23T00:09:43Z |

## License table (direct dependencies)

| Package | License |
| --- | --- |
| `@sparkjsdev/radix` | MIT — see `THIRD_PARTY_LICENSES/sparkjsdev-radix-LICENSE.txt` |
| `three` | MIT — see `THIRD_PARTY_LICENSES/three-LICENSE.txt` |
| Sample assets | CC0 1.0 — see `THIRD_PARTY_LICENSES/SharedTestModels-CC0-LICENSE.txt` |
| `react`, `react-dom`, `vite`, `typescript`, `tailwindcss`, `@tailwindcss/vite`, `@vitejs/plugin-react`, `shadcn`, `lucide-react`, `sonner`, `clsx`, `class-variance-authority`, `tailwind-merge`, `tw-animate-css`, `cn`, `@base-ui/react`, `@hugeicons/*`, `@types/*`, `oxlint` | Per npm (MIT/ISC/Apache-2.0 as published) |

### Radix packaging quirk

`@sparkjsdev/radix@0.0.1` lists ~114 npm `dependencies` (flattened eslint/http-server tooling). The published bundle imports only `three`, `three/webgpu`, and `three/tsl` — not those packages. Do not strip them; `bun install` resolves them under `minimumReleaseAge = 259200` (137 packages on Linux; `fsevents` skipped).

## Tests

```bash
bun test
```

Covers dropped-file validation and stats/backend label formatting.

## Recording note

Demo screenshot and video in the PR were captured on the **WebGL2 fallback (`webgpu-gl`)** because the cloud recording browser had no working WebGPU (headless Chrome). Stats panel reflects the actual backend at runtime.
