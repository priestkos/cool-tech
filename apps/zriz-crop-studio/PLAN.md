# Zriz Crop Studio — PLAN

**Goal:** Single-user offline lab that exercises the real `@zriz/react` image cropper (straighten, rotate, flip, zoom, aspects, export) in cool-tech shadcn chrome.

## Single-user MVP

1. Upload (file + drag-drop) and bundled sample SVG.
2. zriz viewport with straighten dial, 90° rotate, H/V flip, zoom slider, corner handles.
3. Presets: free, original, square, 4:5, 16:9, circle avatar (`shape="circle"`).
4. Before/after preview and PNG/JPEG download via `exportCrop`.
5. Live geometry readout (rect %, rotation, zoom, aspect).
6. Bun tests for presets, transforms, readout, upload validation, export sizing helpers.

**Out of scope:** server upload, auth, batch editing, vendoring zriz sources, mobile native shell.

## Stack

- Vite 8 + React 19 + TypeScript + shadcn minimalist — same eligible pins as `ding-toast-lab`.
- `@zriz/react@0.2.1` + `@zriz/core@0.2.1` — real MIT upstream cropper.

## Dependency age (cutoff launch − 72h ≈ 2026-11-16 05:35 UTC)

| Package | Version | Note |
|---------|---------|------|
| @zriz/react | 0.2.1 | 2026-11-11T22:56:15Z, eligible |
| @zriz/core | 0.2.1 | 2026-11-11T22:56:24Z, eligible |
| Toolchain | per package.json | Pre-cutoff pins from ding-toast-lab |

## Deferred

- Playwright export smoke in CI (browser decode required for `exportImage` in tests).
- Extra shadcn components beyond lab chrome.