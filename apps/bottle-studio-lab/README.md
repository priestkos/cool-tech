# Bottle Studio Lab

Independent local 3D bottle product studio demo for the [cool-tech](https://github.com/priestkos/cool-tech) monorepo.

**Inspiration only:** [bottle-studio](https://github.com/amirmushichge/bottle-studio) (too young at build time for vendoring). This app reimplements similar *behavior* with procedural Three.js geometry—no upstream code or assets.

## Commands

```bash
cd apps/bottle-studio-lab
bun install
bun run dev      # http://localhost:5173
bun run test
bun run typecheck
bun run build
bun run preview  # offline production smoke
```

## Architecture

- `src/features/studio/state.ts` — clamped studio state, silhouettes, light preset multipliers (Bun-tested).
- `geometry.ts` — `LatheGeometry` bottle profile, fill clip, cap.
- `wordmark.ts` — canvas texture label plane.
- `scene.ts` — WebGL renderer, OrbitControls, lights, dispose lifecycle.
- `StudioCanvas.tsx` / `StudioControls.tsx` — canvas + shadcn control shell.

## Verification (2026-11-07)

| Check | Result |
|---|---|
| `bun test` | 4 pass (`state.test.ts`) |
| `bun run typecheck` | pass |
| `bun run build` | pass |
| Age gate | `bunfig.toml` minimumReleaseAge 259200; pins per `PLAN.md` |
| Browser smoke | Desktop + ~390px width; keyboard-reachable controls; reduced-motion respected |
| Artifacts | `artifacts/demo-screenshot.png`, `artifacts/demo-recording.mp4` |

## Limitations

- Independent visual approximation, not pixel-match to upstream.
- Large JS bundle (Three); no code-splitting in MVP.
- Wordmark is a flat plane, not wrapped UV label.
