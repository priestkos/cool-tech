# Terrain Studio — PLAN

**Goal:** A single-page studio that showcases [topographic](https://github.com/yahyabedirhan/topographic) — WebGL contour terrain from real places or procedural shapes — with live controls, PNG export, and persisted settings.

Source: launch post https://x.com/yahyabedirhan/status/2112256463607324996 · npm [`topographic`](https://www.npmjs.com/package/topographic) + [`topographic-react`](https://www.npmjs.com/package/topographic-react)

## Single-user MVP

1. Full-bleed `<Topography>` canvas with a toolbar toggle between `mode: '2d'` and `mode: '3d'`.
2. **Source switcher:** preset built-in locations (Fuji, Grand Canyon, Matterhorn, Everest — no API key; library ships elevation grids) plus **Generate** mode with shape + seed.
3. **shadcn side sheet/panel:** documented knobs — lines (count, width, opacity, indexEvery), terrain (peaks, spread, roughness, sharpness, terracing), theme (ink/paper), `elevation`, camera `motion` speed where relevant, optional `look` preset.
4. **Export PNG** via `topography.snapshot()` on the instance from `onReady`.
5. **localStorage** for source, view mode, and style settings.

**Out of scope:** video `record()`, custom bbox map picker, auth, backend, deploy.

## Tasks (vertical slices)

1. Scaffold Vite + React + TS (`bunx create-vite@latest . --template react-ts`, skip install), `bunfig.toml`, `bun install`, shadcn init (minimalist).
2. Pin `topographic@0.6.0` and `topographic-react@0.6.0` (newest versions allowed under `minimumReleaseAge = 259200` while 0.7.x is too fresh).
3. Layout: fixed full-viewport terrain + collapsible right panel (shadcn Sheet or fixed aside).
4. Wire `Topography` props from React state; `onReady` stores instance for export.
5. Source presets + generate controls; clearing `location` when generating.
6. `snapshot()` download button; loading/error toast if WebGL missing.
7. Persist settings JSON in `localStorage`; hydrate on load.
8. README, `.env.example` (document optional keys only if needed — built-in places need none), screenshot + video, PR.

## Stack

| Piece | Rationale |
| --- | --- |
| Vite + React + TS | Matches repo demos; client-only WebGL |
| shadcn minimalist | Required UI for controls panel |
| topographic-react | Official React bindings |
| localStorage | Single-user persistence |

## Deferred

- Map bbox UI and `fetchLocation` (playground-only complexity)
- MP4/WebM export via `record()`
- Automated tests (manual browser validation for WebGL)
