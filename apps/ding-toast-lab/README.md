# Ding Toast Lab

Inspired single-toast playground ([Ding upstream](https://github.com/YusufCeng1z/ding)) — **not** an integration. Upstream commit/release (2026-11-07) is younger than the repo’s 72h dependency gate, so toast morph behavior is implemented locally with React state and CSS transitions.

## Commands

```bash
cd apps/ding-toast-lab
bun install
bun run dev
```

| Script | Purpose |
|--------|---------|
| `bun run dev` | Vite dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run typecheck` | `tsc -b` |
| `bun test` | Toast model unit tests |

## Architecture

- `src/features/toast/model.ts` — toast snapshot, morph/dismiss, archive/undo helpers
- `src/features/toast/fixtures.ts` — offline timer constants
- `src/features/toast/useToastLab.ts` — timers, promise/progress simulation, dismiss pause
- `src/features/toast/ToastStage.tsx` — accessible live toast UI
- `src/features/toast/PlaygroundControls.tsx` — control cards

## Verification (2026-11-07)

- `bun test` — 6 tests pass
- `bun run typecheck` — clean
- `bun run build` — clean
- Browser smoke: desktop + ~390px, keyboard focus, reduced-motion, offline after build
- Artifacts: `artifacts/demo.png`, `artifacts/demo.mp4`

## Age policy

`bunfig.toml` sets `minimumReleaseAge = 259200`. Pinned versions are listed in `PLAN.md` with registry publication times (IST). No `@yusufceng1z/ding`, no upstream source vendoring.

## Limitations

- One toast only (no queue)
- No sound
- Morph motion is approximate vs upstream spring physics
