# Spark Radix Explorer — PLAN

**Goal:** A one-page viewer where you pick a sample Gaussian-splat scene or drop in your own .ply/.spz, then orbit or fly through it with Radix, while a live panel shows the splat count, frame time and whether WebGPU or the WebGL2 fallback is rendering.

Source buzz: https://x.com/sparkjsdev/status/2115852543708536881 (@sparkjsdev, Oct 2026). Code: https://github.com/sparkjsdev/radix, npm `@sparkjsdev/radix@0.0.1` (MIT, World Labs). Unofficial demo, not affiliated with World Labs or the Spark team.

## Single-user MVP
1. A full-window Radix canvas (three.js 0.186.0), rendered by `createRenderer` + `SplatRenderer`, with a loading/progress overlay and readable errors.
2. Scene picker: two vendored CC0 samples (sparkling_water, a_cute_cat) that work offline, plus two optional streamed CC0 samples (seashell, scarf) from the Radix sample host, each with its source and license shown.
3. Controls: Radix `CameraControls`, with an Orbit/Fly toggle, a short key/mouse legend, a "reset view" button and a "flip" toggle for y-down captures.
4. Live stats panel: splat count, frame time (rolling average, ms and fps) and the backend label from `getGpuCaps`, plus a backend select (Auto / WebGPU / WebGL2) that recreates the renderer.
5. Drag and drop (or a file button) for .ply and .spz, up to 200 MB, decoded by `loadSplats` on a worker, with errors for unsupported or broken files.
6. Header: links to the X post, the repo and npm, the "Unofficial demo" line, and a WebGPU-support note.

**Out of scope:** RAD/RDX streaming LOD, editing or painting splats, multiple scenes at once, export or format conversion in the UI, VR/XR, saving or sharing, auth, deploy.

## Tasks (vertical slices)
1. Check the start time and the 3-day rule for every pinned package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Radix canvas: renderer, camera, one vendored sample loaded and visible, and a resize-safe render loop.
3. Scene picker (vendored and streamed samples, progress, errors, credits) and orbit/fly controls with reset and flip.
4. Stats panel (splat count, frame time, backend label) and the backend select that recreates the renderer cleanly.
5. Drag-and-drop .ply/.spz loader with validation and errors; test it with a PLY generated in /tmp.
6. Tests (file validation, stats formatting), README (pins with dates, samples and licenses, packaging quirk, backend note), screenshot and video, PR.

## Stack
- `@sparkjsdev/radix@0.0.1`: the tech being demoed, its first real release, from npm.
- three 0.186.0 (+ @types/three): Radix's peer dependency, at the version Radix itself builds against.
- Vite + React + TS: least wiring for a client-only page; top-level await and workers work out of the box.
- shadcn/ui minimalist preset (card, button, select, toggle-group, sonner/toast, tooltip): repo standard for the overlay panels.

## Deferred
- RAD/RDX paged LOD streaming of large worlds: needs big hosted assets, not needed to show the renderer.
- In-browser PLY→SPZ conversion and download (`SplatFiles.encode`): easy later, but not core to viewing.
- Multiple splats in one scene, with transforms: Radix supports it; this is a single-scene viewer first.
- Deploy preview: optional per AGENTS.md; do it later on the shared Pages project.
