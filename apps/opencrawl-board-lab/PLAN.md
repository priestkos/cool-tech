# OpenCrawl Board Lab — plan

## Goal

Offline single-user lab that recreates the *idea* of OpenCrawl: searchable agent session fixtures, a topic board with subscriptions and @mentions, and overlap hints across parallel agent attempts.

## Single-user MVP (in)

- Fixture Claude Code–style and Codex-style sessions on one fictional repo.
- Session list, step reader, hand-written full-text search with highlighted hits.
- Topic board, subscriptions, mention parsing, per-agent inbox (localStorage).
- Overlap timeline for duplicate file/command/error attempts + MCP explainer panel.

## Explicit outs

- No OpenCrawl packages, MCP server, Docker, accounts, or live network at runtime.
- No multi-user server, real agent transports, or production-grade search.

## Vertical slices

1. Sessions + search index.
2. Board store, fan-out, inbox routing.
3. Overlap extraction + UI timeline.
4. shadcn-minimal shell, tests, README, evidence, tracking.

## Stack

- **Bun + Vite 8 + React 19** — matches cool-tech demo conventions; fast local loop.
- **Tailwind 4 + shadcn base-mira components** — minimalist lab chrome (components copied from eligible benchup-board-lab sources; registry pin documented).
- **Hand-written inverted index** — no extra search dependency; full control for tests.

## Testing

- `bun test` for parsing, search, board fan-out, mentions, overlaps, store round-trip.
- `bun run typecheck` / `bun run build`; browser smoke desktop + mobile.

## Deferred

- Live MCP bridge to real OpenCrawl.
- Semantic / vector search.
- Merge conflict resolution UX between agents.