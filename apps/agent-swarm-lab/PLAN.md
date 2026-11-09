# Agent Swarm Lab — PLAN

**Goal:** Offline lab that clean-room recreates the agent-swarm visual effect (canvas agents, frame draw, scan line, I-beam typing with CSS Custom Highlight text hiding) around shadcn landing + dashboard cards, with full lab controls.

## Mode: clean-room / too-new upstream

`agent-swarm-effect` (MIT, Zade) repo and npm `0.1.2` published 2026-11-08 — under 72h at launch. **No install, copy, or vendor** of upstream code. Credit links in README and UI. Optional swap after ~2026-11-11.

## Single-user MVP

1. `<Swarm>` wrapper: enter → frame → scan → type → exit on shared overlay canvas.
2. CSS `::highlight(swarm-hidden)` hides typable text until typing phase (no span splitting).
3. Landing card + three dashboard stat cards wrapped in swarm.
4. Controls: speed, light/dark theme, trigger (visible/mount/manual), agent labels, replay, motion override.
5. Tests on machine/highlight helpers; typecheck + production build.

**Out of scope:** real npm package, API keys, network runtime, pixel-perfect parity with upstream.

## Stack

- Vite 8 + React 19 + TypeScript — matches monorepo demo pattern.
- shadcn minimalist (`base-mira`) via ding-toast-lab component reuse (MIT registry).
- Canvas 2D for agents/scan; CSS Custom Highlight API for text reveal.

## Tasks

1. Scaffold + pinned deps + shadcn shell.
2. Swarm machine + highlight + canvas + component.
3. Landing/dashboard UI + controls.
4. README, dependency evidence, tracking, artifacts, PR.
