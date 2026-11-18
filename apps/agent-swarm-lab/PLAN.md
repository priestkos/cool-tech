# Agent Swarm Lab — PLAN

**Goal:** Offline lab that wraps shadcn landing + dashboard cards with the real **`agent-swarm-effect@0.1.2`** React `<Swarm>` and exposes speed, theme, trigger, labels, replay, and reduced-motion controls.

## Mode: real upstream (npm pin)

`agent-swarm-effect` **0.1.2** (MIT, Zade), published **2026-11-08**, tag **v0.1.2** / commit `547224a`. Eligible vs launch cutoff **~2026-11-15 09:45 IST**. Installed from npm; license in `THIRD_PARTY_LICENSES/`.

## Single-user MVP

1. Real `<Swarm>` from `agent-swarm-effect` with `data-swarm` frames on cards.
2. Lab controls wired to upstream props (`trigger`, `speed`, `theme`, `labels`, `names`, `respectReducedMotion`) plus `replay()` / `play()` via refs.
3. Landing card + three dashboard stat cards (direct children / `data-swarm`).
4. Tests against `agent-swarm-effect` / `agent-swarm-effect/vanilla` exports and controller API.
5. Typecheck, production build, browser smoke (desktop + mobile), screenshot + video for PR.

**Out of scope:** vendoring source, API keys, network runtime, pixel-perfect parity with upstream marketing site.

## Stack

- Vite 8 + React 19 + TypeScript — monorepo demo pattern.
- shadcn minimalist (`base-mira`) chrome (existing UI primitives).
- **`agent-swarm-effect@0.1.2`** — canvas agents, scan, CSS Highlight typing.

## Tasks

1. Add npm dependency + THIRD_PARTY_LICENSES; remove clean-room swarm modules.
2. Refactor `App.tsx` + controls to upstream API.
3. Rewrite bun tests; update README, dependency evidence, tracking.
4. Verify install/build/test/smoke; open PR.

## Deferred

- Multi-page routing, custom `theme` objects per card, vanilla `createSwarm` second demo pane.