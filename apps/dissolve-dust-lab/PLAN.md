# Dissolve Dust Lab — PLAN

**Goal:** Offline gallery lab that runs the real dissolve-ui `registry/web` React components and grain engine (`play()`, dust preset) — scratch card, toast+Undo, swipe-to-delete collapse, glossy/like buttons, and a playground for grain/duration/direction.

## Single-user MVP

1. Dust gallery with all five required components from `dissolve-ui@0.0.6` CLI copy (not a particle reimplementation).
2. Toast: grains in/out via real engine; Undo restores dismissed state via `action: { label, onPress }`.
3. Swipe-to-delete rows dissolve, list collapses (height/margin → 0) then `onDelete`.
4. Playground: sliders/chips for grain (2–10px), duration (400–4000ms), direction in/out; “dissolve any card” calls real `play()`.
5. About/credits panel + THIRD_PARTY_LICENSES (MIT Rayan Selmi); bun tests + hash evidence vs 0.0.6 tarball.

**Out of scope:** dissolve-ui 0.0.7+, Nov 21 components (elastic-slider, toggle, progress-steps), RN/Skia stack, live shadcn/dissolve registries, root README edits.

## Stack

- Bun + Vite 8 + React 19 + TS — cool-tech eligible pins from `ding-toast-lab`.
- shadcn `base-mira` — lab chrome only; dissolve components are vendored `src/dissolve/` from CLI `@0.0.6`.
- `dissolve-ui@0.0.6` devDependency — CLI copy only; no runtime npm dissolve-ui engine.

## Cutoff

Launch ~2026-11-23 11:05 IST (05:35Z) → packages must publish/commit before **2026-11-20T05:35:00Z**.

## Tasks

1. Pin package.json, shadcn init, `bunx dissolve-ui@0.0.6 init --web` + add five components.
2. Build gallery + playground App layout; wire toast/swipe demos.
3. Tests (engine options, file hashes, component exports).
4. dependency-evidence.json, README, tracking JSON, smoke video + PR.

## Deferred

- Extra gallery components beyond the five required.
- Cloudflare Pages deploy path.
- Allo font from upstream marketing site.