# Ding Toast Lab — PLAN

**Goal:** Single-user playground that exercises the real `@yusufceng1z/ding` toast engine (spring morph, promise, progress, action patches) inside cool-tech’s shadcn lab chrome.

## Mode: real upstream code

Pinned **`@yusufceng1z/ding@0.0.6`** and **`@yusufceng1z/ding-react@0.0.6`** (npm publish 2026-11-14 16:14 IST; release tag `v0.0.6`). Launch cutoff ~2026-11-15 09:45 IST (72h before launch). Ineligible `0.0.7+` not used.

## Single-user MVP

1. Graphite/ivory playground with control cards and a live `toast.getState()` readout panel.
2. `<Toaster />` from ding-react renders the real morphing pill at `top-center`.
3. Fixtures: `toast.promise`, `toast.update` progress, rapid interrupt, archive+Undo via action patch.
4. `setSprings` toggle for snappy vs default springs (plus OS `prefers-reduced-motion` respected by Ding CSS).
5. Bun tests against `createToaster()` from the core API.

**Out of scope:** sound toggle, multi-position grid, Svelte/Vue ports, vendoring Ding sources.

## Stack

- Vite 8 + React 19 + TypeScript — existing eligible pins unchanged.
- shadcn minimalist (`base-mira`) — lab controls only.
- `@yusufceng1z/ding` + `@yusufceng1z/ding-react@0.0.6` — real MIT upstream toast engine.

## Dependency age (cutoff launch − 72h ≈ 2026-11-15 09:45 IST)

| Package | Version | Published (UTC) | Eligible |
|---------|---------|-----------------|----------|
| @yusufceng1z/ding | 0.0.6 | 2026-11-14T10:44:28Z | yes |
| @yusufceng1z/ding-react | 0.0.6 | 2026-11-14T10:44:46Z | yes |
| react / react-dom | 19.3.1 | 2026-10-14 | yes |
| vite | 8.3.5 | 2026-10-21 | yes |
| (other app pins) | per package.json | pre-2026-11-10 | yes |

## Tasks

1. Add ding deps + THIRD_PARTY_LICENSES. ✓
2. Replace local morph model with `useDingLab` + `ToastInspector`. ✓
3. Rewrite tests for `createToaster()`. ✓
4. README, tracking `real-code`, smoke artifacts, PR.