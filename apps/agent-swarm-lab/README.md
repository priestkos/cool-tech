# Agent Swarm Lab

Offline playground for the official **`agent-swarm-effect@0.1.2`** (MIT © [Zade](https://github.com/zadescoxp/agent-swarm-effect)): wrap shadcn cards with `<Swarm>`, tune trigger/speed/theme, and watch canvas agents draw frames, scan, and type text in via the **CSS Custom Highlight API**.

- **Upstream:** [npm](https://www.npmjs.com/package/agent-swarm-effect) · [site](https://zadescoxp.github.io/agent-swarm-effect/) · [GitHub](https://github.com/zadescoxp/agent-swarm-effect) · pin **0.1.2** / tag `v0.1.2`
- **License copy:** `THIRD_PARTY_LICENSES/agent-swarm-effect-LICENSE.txt`

## Commands

```bash
cd apps/agent-swarm-lab
bun install
bun run dev      # http://localhost:5173
bun test
bun run typecheck
bun run build
bun run preview
```

## Architecture

- `src/App.tsx` — two `<Swarm>` instances (landing + stats grid), refs for `replay()` / `play()`.
- `src/features/lab/PlaygroundControls.tsx` — lab chrome mapped to upstream props.
- `src/lib/highlight-capability.ts` — Custom Highlight capability hint for the control panel.
- Tests: `src/tests/upstream-swarm.test.ts` — exports + `createSwarm` controller surface.

## Browser support (Custom Highlight API)

Character-by-character typing uses `CSS.highlights` (Chromium 105+, Safari 17.2+, Firefox 140+). Where unavailable, upstream shows text when the typist arrives.

## Dependency age

`bunfig.toml` sets `minimumReleaseAge = 259200`. Direct pins and lockfile audit live in `dependency-evidence.json` (cutoff **~2026-11-15T04:15:00Z**, launch minus 72h). Upstream `agent-swarm-effect@0.1.2` published **2026-11-08T08:20:16Z** — eligible.

## shadcn / MIT

UI primitives follow shadcn minimalist (`base-mira`) patterns; see `dependency-evidence.json` → `shadcnSourceCandidate`.

## What changed (remake)

Replaced the Nov 9 clean-room canvas/highlight recreation with the real npm package while keeping the lab UI and controls.