# Psychoscript Lab

Offline lab for the real [**psychoscript**](https://www.npmjs.com/package/psychoscript) **0.3.0** confined JS VM (MIT, OpenCode / anomalyco). Independent cool-tech demo — **not** official upstream software.

## Commands

```bash
cd apps/psychoscript-lab
bun install
bun run dev          # Vite UI + Bun API (localhost only)
bun test
bun run typecheck
bun run build        # prints gzip sizes for dist assets
bun run smoke        # Playwright desktop + mobile smoke (starts servers)
```

| Script | Purpose |
|--------|---------|
| `bun run dev` | `scripts/dev.ts` → `server/index.ts` on `127.0.0.1:4177` + Vite with `/api` proxy |
| `bun test` | psychoscript suspend/resume/fork/escape tests |
| `bun run build` | `tsc -b && vite build` |
| `bun run smoke` | 1440×900 and 390×844, focus/overflow/console/external-request checks |

## Architecture

- **Bun server** runs `psychoscript` with `Host.fn` / `Host.namespace` mock tools: `weather.get`, `weather.poll` (slow idempotent async), `search.query`, `todo.*`, optional `tools.slowWrite` (non-idempotent).
- **Vite + React** editor, live tool-call log, pause/download `.psnap`, resume (parent), **resume via `Bun.spawn` child** (`scripts/resume-child.ts`), fork sunny vs rainy, corrupt-byte `SnapshotError`, escape probes, About panel.
- No interpreter in the browser bundle; no runtime network or API keys.

## Package provenance

Obtained from npm registry pin **`psychoscript@0.3.0`** (published `2026-11-24T05:20:45.186Z`). Transitive: `acorn@8.15.0`. See `dependency-evidence.json`.

## Credits

- Upstream: https://github.com/anomalyco/psychoscript  
- Site: https://psychoscript.com  
- Launch: https://x.com/opencode/status/2125702030832349374  

MIT — see `THIRD_PARTY_LICENSES.md` and the in-app About panel.