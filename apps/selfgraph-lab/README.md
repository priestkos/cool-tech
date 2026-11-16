# SelfGraph Lab

Local offline lab inspired by [SelfGraph](https://github.com/hydra-db/selfgraph) (HydraDB, Apache-2.0): text → versioned knowledge graph with source passages, supersession instead of deletion, and BM25 + traversal retrieval (no vectors).

Launch context: [HydraDB on X](https://x.com/hydra_db/status/2121641812804698511) (Nov 14 2026). This demo pins **`@hydradb/selfgraph@0.1.0`** (published 2026-11-09); newer **0.2.x** builds are deferred under the repo 3-day dependency rule.

## Commands

```bash
cd apps/selfgraph-lab
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

Production JS bundle (Nov 2026 build): **~94.5 KB gzip** (`dist/assets/index-*.js`).

## Architecture

| Layer | Role |
| --- | --- |
| `src/lib/graph/*` | Clean-room in-memory graph: deterministic extraction, supersession, BM25 + BFS retrieval, snapshot round-trip — **runs in the browser** |
| `@hydradb/selfgraph@0.1.0` (dev) | Test harness only (`entityId` parity); full SDK needs Neo4j/Kuzu and is not bundled |
| `src/components/ForceGraph.tsx` | `d3-force` SVG graph |
| UI | shadcn minimalist chrome; credits SelfGraph in header |

No API keys, accounts, or network calls at runtime.

## License notice

SelfGraph upstream is Apache-2.0. This app’s lab code is part of the cool-tech demo monorepo; upstream notices remain in the published `@hydradb/selfgraph` package when used in tests.

See `dependency-evidence.json` for pinned versions and age-cutoff notes.