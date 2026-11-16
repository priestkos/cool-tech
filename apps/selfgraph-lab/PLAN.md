# SelfGraph Lab — plan

## Goal

Demonstrate SelfGraph-style knowledge graphs locally: provenance-linked facts, temporal supersession, and vector-free BM25 + graph retrieval.

## Single-user MVP

**In:** paste/load original sample notes, deterministic extraction, force graph UI, timeline as-of, retrieval + answerability, mock LLM toggle, in-memory store with JSON round-trip.

**Out:** live Neo4j/Kuzu, real LLM calls, cloud sync, multi-user auth, `@hydradb/selfgraph@0.2.x`.

## Vertical slices

1. Extraction + force graph + provenance panel
2. Timeline slider + employer supersession (Ann → Northwind → Cascade)
3. Question retrieval (seeds, path highlight, missing terms)

## Stack

- Bun + Vite React TS (pinned toolchain from `ding-toast-lab`)
- shadcn minimalist (components copied from sibling app with established provenance)
- Browser: clean-room `LabGraphStore` (Neo4j-backed SDK is Node-only)
- Tests: `bun:test` + `@hydradb/selfgraph@0.1.0` for `entityId` harness
- `d3-force@3.0.0` for layout

## Testing

- `bun test` for extraction, provenance, supersession, retrieval, answerability, snapshot
- `bun run typecheck` + `bun run build` (report gzip JS size)
- Manual browser smoke desktop/mobile with screen recording

## Deferred

- Full `GraphStore` adapter to run `SelfGraph` class in-browser
- Optional persistence to `localStorage`
- Schema-guided extraction aligned with SelfGraph ontology JSON