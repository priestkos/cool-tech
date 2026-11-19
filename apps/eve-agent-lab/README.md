# Eve Agent Lab

Independent cool-tech demo for the real [Vercel eve](https://eve.dev) agent framework (`eve@1.0.0`, Apache-2.0). The lab runs fully offline with `mockModel` from `eve/evals` (AI SDK `ai@7.0.172`) and exposes chat, approvals, durability checkpoints, OTel spans, and agent-folder editing.

## Requirements

- **Node.js 24+** (eve 1.0.0 engine requirement). Bun is used for installs/scripts; the eve dev child process runs on Node.
- No API keys in default mode.

## Commands

```bash
cd apps/eve-agent-lab
bun install
bun run dev      # Vite UI + proxied eve dev server
bun test         # unit + integration (integration expects dev server on 127.0.0.1:5173)
bun run typecheck
bun run build
```

Production JS (main chunk, gzip): ~211 KB after `bun run build`.

## Architecture

| Piece | Role |
| ----- | ---- |
| `agent/` | Real eve agent folder (`instructions.md`, `agent.ts`, `tools/`, `channels/`, `instrumentation/`) |
| `eveVite()` | Proxies `/eve/v1/*` to local `eve dev` |
| `useEveAgent` | Browser chat, resume, approve/deny |
| `src/lab/vite-lab-plugin.ts` | Lab-only APIs: file tree, instructions editor, crash kill, trace/step log |
| `agent/instrumentation/lab-memory-traces.ts` | In-memory OTel exporter flushed to `.eve/lab-spans.json` |

Optional runtime model keys are written only under `.eve/lab-runtime.json` (gitignored), never committed.

## Upstream docs

Follow [eve's own documentation](https://eve.dev/docs) for production patterns. This repo does not vendor eve beyond the pinned npm package.

## Credits

- [eve.dev](https://eve.dev) · [github.com/vercel/eve](https://github.com/vercel/eve) (Apache-2.0)
- Launch context: [Vercel announcement](https://x.com/vercel/status/2122758127968027108)

This is an unofficial playground, not an official Vercel product. See `THIRD_PARTY_LICENSES`.