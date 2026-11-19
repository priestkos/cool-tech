# Zriz Crop Studio

Offline browser lab for the real [zriz](https://zriz.dev) image cropper ([MIT](https://github.com/pqoqubbw/zriz)). Uses **`@zriz/react@0.2.1`** and **`@zriz/core@0.2.1`** — not a local reimplementation.

## Commands

```bash
cd apps/zriz-crop-studio
bun install
bun run dev      # http://localhost:5173
bun test
bun run typecheck
bun run build    # reports gzip sizes from Vite
```

## Features

- Upload or drag-drop a photo, or load the bundled sample.
- Straighten dial, rotate 90°, flip H/V, zoom (slider + wheel/pinch), corner-handle crop.
- Aspect presets: free, original, square, 4:5, 16:9, circle avatar.
- Before/after preview and PNG/JPEG export via `exportCrop` from `@zriz/core/dom`.
- Geometry readout panel (crop rect, rotation, zoom, aspect).

## Architecture

- `src/features/crop/CropStudioEditor.tsx` — zriz `Cropper.*` parts + export bar.
- `src/features/crop/*` — presets, upload validation, readout formatting, Bun tests.
- shadcn minimalist chrome for layout cards and controls only.

## Upstream

- Docs: [zriz.dev](https://zriz.dev)
- Source: [github.com/pqoqubbw/zriz](https://github.com/pqoqubbw/zriz)
- Launch: [X post](https://x.com/pqoqubbw/status/2120196887156543507)

Independent demo — not affiliated with pqoqubbw or the zriz project.

See [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md) for license text.