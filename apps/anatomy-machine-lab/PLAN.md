# Anatomy Machine Lab — PLAN

**Goal:** One page with three hand-built, interactive isometric machines (clock gearbox, pour-over coffee machine, water pump) with live readouts, a scrubbable timeline and hover-to-explain parts.

Source buzz: https://x.com/sumitdesk/status/2117563737968369925. Inspired by https://github.com/wheresryan22/anatomy. Unofficial community demo; nothing from the upstream repo is installed or copied.

## Single-user MVP
1. Isometric SVG renderer from part data.
2. Three machines, each a pure `state(t)` simulation with readouts.
3. Timeline: play/pause, speed, scrub, reset.
4. Hover/focus highlight with label callouts and a parts list.
5. Optional canvas/WebGL effects overlay with fallback; reduced-motion respected.
6. Light/dark, header with links, disclaimer, credit.

**Out of scope:** generating machines from a question, LLMs, user-built machines, 3D camera orbit, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for every package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Isometric math + renderer + clock machine + timeline + tests.
3. Coffee machine and pump + tests.
4. Hover highlight, readouts panel, effects overlay.
5. Theme, header, README (credits, pins with dates, license table, limits), screenshot and video, PR.

## Stack
- Hand-rolled SVG + rAF: deterministic and scrubbable, no dependency.
- Vite + React + TS, shadcn/ui minimalist preset: repo standard.

## Deferred
- More machines; shareable URL per machine/time; deploy preview.
