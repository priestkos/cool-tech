# Bottle Studio Lab — PLAN

**Goal:** Polished local interactive 3D bottle product studio (shape, glass, fill, lighting, camera, wordmark) for one user on one responsive screen.

**Inspiration (fixture-only):** https://github.com/amirmushichge/bottle-studio and https://amirmushichge.github.io/bottle-studio/ — upstream root commit and v1.0.0 are younger than 72h at launch, so this demo is an **independent approximation** with no upstream source, shaders, assets, or vendoring.

## Single-user MVP

- Lathe bottle + cap + procedural fill, `MeshPhysicalMaterial` glass, local lights, OrbitControls, canvas wordmark.
- Control groups: silhouette presets, body/shoulder/neck/height, glass/fill colors, light preset & rotation, camera zoom, wordmark text, reset.
- WebGL fallback copy; capped DPR; dispose on unmount; reduced-motion disables auto-rotate.
- Bun tests for state clamps/presets/reset.

**Out of scope:** HDR/CDN assets, uploads, accounts, cloud render, photoreal bokeh, upstream integration.

## Tasks (vertical slices)

1. PLAN + bunfig age gate + Vite React TS scaffold + shadcn base-mira shell (warm ivory/charcoal).
2. `features/studio/state` + tests.
3. `geometry`, `wordmark`, `scene` (raw Three + OrbitControls).
4. `StudioCanvas` + `StudioControls` + responsive layout.
5. README, artifacts (screenshot + video), `tracking/bottle-studio-lab.json`, PR.

## Stack

- **Vite 8.3.5 + React 19.3.1 + TS 6.0.3** — one-screen app, repo standard.
- **Three 0.180.0** — scene/physical material without R3F.
- **shadcn 4.22.1 (base-mira)** — control primitives; system fonts only (no icon/font CDN packages).

## Dependency age table (baseline cutoff 2026-11-04 10:09 IST)

Evidence: `https://registry.npmjs.org/<package>` and `dependency-evidence.json` at launch.

| Package | Version | Published (IST) |
|---|---|---|
| react | 19.3.1 | 2026-10-14 22:17:15 |
| react-dom | 19.3.1 | 2026-10-14 22:19:10 |
| vite | 8.3.5 | 2026-10-21 12:08:54 |
| typescript | 6.0.3 | 2026-04-17 05:08:27 |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 15:38:27 |
| tailwindcss | 4.3.3 | 2026-07-16 17:33:35 |
| @tailwindcss/vite | 4.3.3 | 2026-07-16 17:34:06 |
| shadcn | 4.22.1 | 2026-10-18 23:42:18 |
| three | 0.180.0 | 2025-09-03 17:18:29 |
| @types/three | 0.180.0 | 2025-09-04 00:08:36 |
| @base-ui/react | 1.9.0 | 2026-10-09 14:22:43 |
| (+ shared utility pins per launch brief) | | |

`bunfig.toml` keeps `[install] minimumReleaseAge = 259200` with no exclusions.

## Deferred

Upstream vendoring after 72h + license check; GLTF pipeline; volume simulation; image upload.
