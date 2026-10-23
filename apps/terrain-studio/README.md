# Terrain Studio

A small studio UI around [topographic](https://github.com/yahyabedirhan/topographic) — WebGL contour terrain in 2D and 3D — with live controls, PNG export, and settings persisted in `localStorage`.

## Run

```bash
cd apps/terrain-studio
bun install
bun run dev
```

## Package pin

This demo uses `topographic@0.6.0` and `topographic-react@0.6.0` (the newest allowed under `bunfig.toml` `minimumReleaseAge = 259200` while 0.7.x is still too fresh).

## Features

- Full-viewport `Topography` with 2D / 3D toggle
- **Real places**: Mount Fuji, Grand Canyon, Swiss Alps (Matterhorn), Himalayas (Everest) via the `location` setting
- Procedural **shapes** and curated **looks** from the library
- Side panel wired to documented params (`lines`, `terrain`, `motion`, `layout`, `theme`, `camera`, `elevation`, `detail`)
- PNG export via `topography.snapshot()`
- Settings saved under `terrain-studio:v2` in `localStorage`

## Links

- [Playground](https://topographic.yahyapak.dev/)
- [npm: topographic](https://www.npmjs.com/package/topographic)
- Launch post: https://x.com/yahyabedirhan/status/2112256463607324996
