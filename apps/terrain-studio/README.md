# Terrain Studio

A small studio UI around [topographic](https://github.com/yahyabedirhan/topographic) — WebGL contour terrain in 2D and 3D — with live controls, PNG export, and settings persisted in `localStorage`.

## Run

```bash
cd apps/terrain-studio
bun install
bun run dev
```

## Package pin

This demo installs `topographic@0.3.0` and `topographic-react@0.3.0`, the newest versions allowed by `bunfig.toml` (`minimumReleaseAge = 259200`). That release exposes procedural **shapes** (`styleName`) and `snapshot()` export, but not the built-in **location** presets added in later releases. See `.env.example` for notes on upgrading.

## Features

- Full-viewport `TopographicBackground` with 2D / 3D toggle
- Side panel wired to documented params (`lines`, `terrain`, `motion`, `layout`, `theme`, `camera`, `elevation`, `detail`)
- Curated `PRESETS` from the library
- PNG export via `topography.snapshot()`
- Settings saved under `terrain-studio:v1` in `localStorage`

## Links

- [Playground](https://topographic.yahyapak.dev/)
- [npm: topographic](https://www.npmjs.com/package/topographic)
- Launch post: https://x.com/yahyabedirhan/status/2112256463607324996
