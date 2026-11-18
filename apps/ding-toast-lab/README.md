# Ding Toast Lab

Playground for the real [**Ding**](https://github.com/YusufCeng1z/ding) toast engine, pinned at **`@yusufceng1z/ding@0.0.6`** and **`@yusufceng1z/ding-react@0.0.6`** (MIT). The morphing pill, timers, and promise helper come from upstream — not a local reimplementation.

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
| `bun test` | Upstream `createToaster()` tests |

## Architecture

- `src/features/toast/useDingLab.ts` — fixtures calling `toast.*` / `setSprings`
- `src/features/toast/ToastInspector.tsx` — `useSyncExternalStore(toast.subscribe, …)` readout
- `src/features/toast/PlaygroundControls.tsx` — shadcn control cards
- `src/features/toast/ding.test.ts` — behavior via real `@yusufceng1z/ding` API
- `App.tsx` — mounts `<Toaster position="top-center" />`

## Upstream credit

- Repo: https://github.com/YusufCeng1z/ding  
- Docs: https://ding.yusufcengiz.dev  
- License: MIT — see `THIRD_PARTY_LICENSES/ding-MIT-LICENSE.txt`

## Age policy

`bunfig.toml` sets `minimumReleaseAge = 259200`. Ding `0.0.6` predates the launch cutoff (2026-11-15 ~09:45 IST). Newer npm versions (`0.0.7+`) are intentionally excluded.

## Verification (2026-11-18)

| Check | Result |
|-------|--------|
| `bun test` | 6 pass (`createToaster` + archive helpers) |
| `bun run typecheck` | clean |
| `bun run build` | clean; `index-*.js` gzip **97.77 kB** |
| Browser smoke | desktop ~1440×900 + mobile ~390×844; console clean; localhost only |

## Limitations

- One visible toast (upstream default); held/queue modes not demoed
- Sound API exists upstream but is not toggled in this lab