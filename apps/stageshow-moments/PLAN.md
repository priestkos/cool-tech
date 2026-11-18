# Stageshow Moments — PLAN

**Goal:** A one-page bento gallery of fictional product moments, each rendered with Benji Taylor’s vendored Stageshow React kit (`stageshow-v1.1.1`) and `Stage`/`Act` scripts—not a clean-room reimplementation.

Source buzz: https://x.com/benjitaylor/status/2116593247854453244 · Upstream: https://github.com/benjitaylor/skills/tree/stageshow-v1.1.1/stageshow (MIT, commit `299140fafd08df55a9c234e610c3f64af3f45531`).

## Single-user MVP

1. Vendored kit at `vendor/stageshow/kit/` with provenance in `vendor/stageshow/UPSTREAM.md` and `THIRD_PARTY_LICENSES/stageshow-LICENSE.txt`.
2. Five tiles (Wavelet hero, Dayline, Tallypay, Natter, stat) authored as kit scenes with `Stage`, `Window`, `Act.script`, and kit motion parts.
3. Lab chrome (shadcn): bento grid, Before/After, Replay, All Before/After, reduced-motion toggle, Open dialog.
4. Load stagger replays non-stat moments once; reduced motion shows poster stills via `StillContext`.
5. Tests hit vendored `ease`, `measure`, registry validation, and view-mode resolution.

**Out of scope:** Playwright `film.mjs`, portless playground parity, upstream gold examples copied wholesale, deploy, persistence, real brands.

## Tasks (vertical slices)

1. Pin toolchain (bunfig 72h rule, Vite/React/shadcn pins per cool-tech contract); vendor kit at `stageshow-v1.1.1`.
2. Moment scenes on real `Stage` API; replace custom timeline/CSS faux kit.
3. Controller + bento shell wiring; delete inspired-only modules.
4. README, tracking record (`real-code`), tests, smoke (desktop + mobile), screenshot + video for PR.

## Stack

- **Vendored Stageshow kit:** real `Stage`/`Act` motion and measuring—why this remake exists.
- **Vite + React 19 + Bun:** repo-standard client lab runner.
- **shadcn minimalist:** page chrome only; product UI is kit-native.

## Testing

- `bun test` — registry, vendored ease/measure, replay view mode.
- `bun run typecheck`, `bun run build` (report gzip bundle).
- Browser smoke @ ~1440×900 and ~390×844, console clean.

## Deferred

- Filming gates via upstream `scripts/film.mjs`.
- Additional gold examples from upstream `examples/`.
- Dark theme parity with upstream playground.