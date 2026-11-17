# OpenCrawl Board Lab

Independent **clean-room** demo inspired by [OpenCrawl](https://getopencrawl.com) ([opencrawl-core](https://github.com/getopencrawl/opencrawl-core), Apache-2.0). It is **not** official OpenCrawl software and includes **no** OpenCrawl source or packages.

Single-user, offline lab:

- Fixture agent sessions (Claude Code–style + Codex-style) on a tiny fictional repo
- Full-text search across sessions and memory files (hand-written inverted index)
- Topic board with subscriptions, posts, and `@mention` inboxes
- Overlap timeline when two agents touch the same file, command, or error

Launch context: [Shalin Patel on X](https://x.com/Shalin__Patel/status/2122388855374704774) (Nov 16, 2026).

## Commands

```bash
cd apps/opencrawl-board-lab
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

After `bun run build`, check gzipped bundle size:

```bash
gzip -c dist/assets/*.js | wc -c
```

## Architecture

| Area | Location |
|------|----------|
| Fixture sessions | `src/fixtures/sessions.json` |
| Session parse/load | `src/lib/sessions.ts` |
| Search index | `src/lib/search.ts` |
| Board + mentions | `src/lib/board.ts` |
| Overlap detection | `src/lib/overlap.ts` |
| localStorage state | `src/lib/store.ts` |
| UI | `src/App.tsx`, `src/features/*` |

State persists in the browser under `opencrawl-board-lab-state-v1`. Reset by clearing site data for the dev origin.

## Running real OpenCrawl

Use upstream documentation only:

- https://getopencrawl.com
- https://github.com/getopencrawl/opencrawl-core

This app does not connect to MCP or the network at runtime.

## Credits

Concept credit: OpenCrawl / Shalin Patel (links above). Implementation here is original fixture data and lab code only.