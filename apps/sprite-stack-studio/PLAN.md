# Sprite Stack Studio — Plan

## Goal
Local offline studio wrapping the real danielwh2/sprite-stacking slicer (`views_to_slices.py`) and viewer (`viewer.html`) at commit `6fecdfd0d6e5a0595f979550e05f4b1fcde550fe`.

## MVP (in scope)
- Gallery of 4 pre-carved original demo 4-view sheets (pot `--round`, car, tree, lantern/crate).
- Upload PNG → Bun API spawns real Python CLI → return slice strip + self-contained viewer HTML.
- Slicer controls: `--slices`, `--round`, `--colours` (+ optional real flags exposed in advanced panel).
- Full upstream viewer in iframe (`--html` output): Turntable, Scan, Exploded, Scene, Play/Drive, time/weather, 16-dir export.
- About/credits with MIT notice; dependency-evidence.json; tests (hash, check.py, CLI, server).

## Out of scope
- JS port of slicer/viewer, Three.js/WebGL stand-in, network at runtime, skills CLI.

## Stack
- Bun + Vite + React 19 + shadcn minimalist (base-mira); Bun.serve API; Python 3.12 venv with pillow==13.0.0, numpy==2.5.5.

## Tasks
1. Vendor pin tree + verify SHA-256.
2. Python venv + generate sample sheets + pre-carve gallery assets.
3. Bun slicer server (spawn CLI, serve viewer HTML, static gallery).
4. React shell: gallery, upload, settings, viewer iframe, About.
5. Tests + typecheck + build + browser smoke + PR artifacts.