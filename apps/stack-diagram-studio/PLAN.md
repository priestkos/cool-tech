# Stack Diagram Studio — PLAN

**Goal:** One page where a one-sentence stack description becomes a live, draggable architecture diagram, exportable as HTML and PNG.

Source buzz: https://x.com/caru_ini/status/2117422380935168035. Inspired by https://github.com/caru-ini/stack-diagram (MIT). Unofficial community demo; nothing from the upstream repo is installed or copied, and no official vendor logos are used.

## Single-user MVP
1. Input with live deterministic keyword parser over a local catalog (no LLM).
2. Deterministic layered auto layout with inferred arrows, in SVG.
3. Generic icons + monogram badges per tile; Unknown tiles editable.
4. Drag to arrange (grid snap), reset layout.
5. Presets, light/dark, URL hash state.
6. Export standalone HTML and 2x PNG.
7. Header with links, disclaimer, credit.

**Out of scope:** LLM parsing, React code export, official logos, multi-diagram projects, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for every package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Catalog + parser + tests.
3. Layout + edges + SVG render + tests.
4. Drag, presets, theme, URL state.
5. HTML/PNG export + tests.
6. README (credits, pins with dates, license table, limits), screenshot and video, PR.

## Stack
- Hand-rolled SVG + React: deterministic, no dependency.
- Vite + React + TS, shadcn/ui minimalist preset: repo standard.

## Deferred
- React component export; custom catalog entries saved locally; deploy preview.
