# PixelFX Forge — PLAN

**Goal:** One page to browse, tune, recolor, play in an arena and export as sprite sheets any of pixelfx's 244 pixel-art effects.

Source buzz: https://x.com/Mnilax/status/2117326790930907173. Library: https://github.com/patch-gg/pixelfx (MIT) pinned to commit a84159688af3ca37a4be05a0d422b94451b2e24e (2026-10-31). Unofficial community demo.

## Single-user MVP
1. Searchable category grid of effects.
2. Big pixelated stage: play/pause, scrub, loop, speed, scale, flip, seed, background.
3. Palette presets and swatch editing.
4. Arena with the stock dummy and click-to-hit target for acted effects.
5. Browser sprite-sheet PNG + JSON export.
6. URL hash state; header with links, disclaimer, credits.

**Out of scope:** authoring new effects, the Claude skill, custom characters, GIF export, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for every package and the pinned SHA. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Catalog + search + tests.
3. Stage renderer with deterministic stepping/scrub + tests.
4. Controls, palette, URL state + tests.
5. Arena (createAct, hit replay, shake).
6. Sprite-sheet export + tests.
7. README (credits, pins with dates, licence table, caveats), screenshot and video, PR.

## Stack
- pixelfx at a pinned commit: the subject; zero deps.
- Vite + React + TS, shadcn/ui minimalist preset: repo standard.

## Deferred
- GIF export; side-by-side compare; custom character sprites.
