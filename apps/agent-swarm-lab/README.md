# Agent Swarm Lab

Offline demo of a **clean-room** agent-swarm visual effect: canvas “agents” draw a card frame, a scan line sweeps, and an I-beam cursor types text in while copy stays hidden via the **CSS Custom Highlight API** (`::highlight(swarm-hidden)`), not DOM span-splitting.

This is **not** the official [`agent-swarm-effect`](https://www.npmjs.com/package/agent-swarm-effect) package. Upstream ([website](https://zadescoxp.github.io/agent-swarm-effect/), [GitHub MIT © Zade](https://github.com/zadescoxp/agent-swarm-effect)) was published **2026-11-08** — under the repo’s 72h dependency rule at launch — so no upstream code was installed or copied. After **~2026-11-11** a follow-up could swap to the real npm package.

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

- `src/features/swarm/Swarm.tsx` — wrapper, rAF state machine, highlight sync, shared overlay canvas.
- `src/features/swarm/machine.ts` — pure phase/tick/replay/reduced-motion logic (unit-tested).
- `src/features/swarm/highlight.ts` — typable text segments + `CSS.highlights` hidden ranges.
- `src/features/swarm/canvas.ts` — agents, frame stroke, scan line, I-beam caret drawing.
- `src/features/lab/PlaygroundControls.tsx` — speed, theme, trigger, labels, replay.

## Browser support (Custom Highlight API)

Hides typable text only when `CSS.highlights` is available. Supported in Chromium 105+, Safari 17.2+, Firefox 136+. Otherwise text remains visible and the canvas animation still runs.

## Dependency age

`bunfig.toml` sets `minimumReleaseAge = 259200`. Direct pins and lockfile audit live in `dependency-evidence.json` (cutoff **2026-11-06T03:30:00Z**). Lockfile audit: **0** resolved versions newer than cutoff; see `lockfileAudit.tooNew`.

## shadcn / MIT

UI primitives follow shadcn minimalist (`base-mira`) patterns; component files reused from sibling `ding-toast-lab` after registry provenance review (see `dependency-evidence.json` → `shadcnSourceCandidate`).

## Deferred

- Replace clean-room `Swarm` with official `agent-swarm-effect` once npm/source passes 72h age gate (~2026-11-11).
