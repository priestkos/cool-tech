# Glorpies Agent Roster — PLAN

**Goal:** One page with a fake AI-agent team whose glorpies avatars show each agent's state, plus a seed explorer for any name.

Source buzz: https://x.com/friednoodlz/status/2117254897506902154. Library: glorpies@0.1.1 (MIT, https://github.com/sunrakerr/glorpies). Unofficial community demo.

## Single-user MVP
1. Roster of fictional agents with state-driven faces and a simulated task loop + log.
2. Manual state change and poke.
3. Size strip (24-96px).
4. Seed explorer: seedOf, six states, looks, shapes, background, random name, add to roster.
5. SVG/PNG export; URL/local state; header with links, disclaimer, credit.

**Out of scope:** real agents/LLMs, server images, GIF export, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for every package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Agent state machine + tests.
3. Roster UI with Glorpie faces, simulate loop, log.
4. Seed explorer + parsing tests.
5. Export + tests; URL/local state.
6. README (credits, pins with dates, licence table), screenshot and video, PR.

## Stack
- glorpies 0.1.1 React entry: the subject; zero deps.
- Vite + React + TS, shadcn/ui minimalist preset: repo standard.

## Deferred
- Web component variant; GIF export; real agent status feed.
