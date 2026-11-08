# soundcn Board — PLAN

## Goal

Build a compact local-only tactile UI soundboard that plays verified Kenney CC0 sounds from the pinned soundcn registry on deliberate user gestures, with master mute/volume, per-control presets, and honest provenance.

## Single-user MVP

**In scope:** One screen with labeled button/toggle/notification zones, preset picker per zone, master mute + volume, “Enable sound” gate, last-played highlight, small event log, reset, provenance drawer, keyboard + reduced-motion support, automated tests for gesture/mute/preset logic.

**Out of scope:** Recording/upload, accounts, network catalog sync, Blizzard/WoW assets, background loops, mobile app shell, deploy.

## Vertical slices

1. **Scaffold + pins** — Vite/React/Bun with age-gated `bunfig.toml`, pinned deps, shadcn minimalist UI (copied from sibling app after provenance check).
2. **Registry integration** — Copy `use-sound`, `sound-engine`, `sound-types`, and five CC0 Kenney assets from soundcn `7cbfbb3f…`; adapt hook for global mute/volume and stop-on-mute.
3. **Board UI** — Gesture-only playback, enable-sound entry, controls, event log, provenance.
4. **Tests + evidence** — `bun test`, typecheck, build, browser smoke, screenshot/video, `dependency-evidence.json`, `tracking/soundcn-board.json`.

## Stack

| Piece | Rationale |
|-------|-----------|
| Bun + Vite 8 | Monorepo standard; fast dev and tests |
| React 19 | Matches pinned toolchain |
| shadcn/base-mira | Minimal accessible controls without custom CSS soup |
| soundcn registry (MIT code, CC0 audio) | Real upstream integration at immutable SHA |

## Testing

- Unit tests: mute stops playback, volume bounds, preset mapping, reset clears log, play requires enabled sound.
- Manual: desktop 1440×900 + mobile 390×844, keyboard paths, no console errors, no external requests.

## Deferred

- Lazy decode-only-on-first-play (hook already decodes on mount upstream).
- Deploy to Cloudflare Pages path.
- Additional sound packs beyond verified five.
