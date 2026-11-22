# Frostwind World Lab — PLAN

**Goal:** Offline browser lab that runs the real Trinity Frostwind compiler (pinned MIT sources) to compile deterministic biome frames, show scale authority from `scale.js`, and prove same-seed pixel identity.

## Mode: real upstream code

Vendored `trinity-works/frostwind` at `537ed51d215096df54ab45770f4f811481a2986b` (committer 2026-11-19T09:21:43Z). `three@0.160.1` only extra runtime dep.

## Single-user MVP

1. Biome picker: Frostwood, Sun Meadow, Green Swamp, Amber Waste (`frostwood`, `meadow`, `swamp`, `desert`).
2. Scale table from `scale.js` + `measureDeer()` (traveller 26 px = 1.70 m; roe buck 1.18 m → 20 px silhouette).
3. Seed control, compile, re-render same seed; fingerprint proves match / seed change.

**Out of scope:** Hollow picker requirement, Remotion/Playwright/Fly deploy, music, multiplayer, Frostwind full game UI.

## Stack

- Vite 8 + React 19 + shadcn minimalist — cool-tech eligible pins.
- Vendored Frostwind `src/` + `FrostwoodWorld` GPU path (no lookalike generator).

## Testing

- Bun: scale/biome/roe measurements; optional WebGL compile when context available.
- Manual: desktop + mobile smoke, screen recording for PR.

## Deferred

- Chunk worker bundle (sync fallback sufficient for lab).
- Amethyst Hollow in picker; Pond Court deep links.