# Stack Diagram Studio

**Unofficial community demo.** Not affiliated with [caru-ini](https://github.com/caru-ini) or [stack-diagram](https://github.com/caru-ini/stack-diagram), or with any vendor named in the parser catalog. Product names are trademarks of their owners; no official logos are used.

Type a one-sentence stack (for example: `Next.js on Vercel, Hono API, Postgres on Neon, Clerk auth, Stripe`) and a live architecture diagram draws itself in the browser. Parsing is deterministic and local — no LLM, no backend, no API keys.

Idea inspired by [caru-ini/stack-diagram](https://github.com/caru-ini/stack-diagram) (MIT). This demo reimplements the concept from scratch; no upstream code, prompts, templates, or assets are copied or vendored.

Source buzz: [X post](https://x.com/caru_ini/status/2117422380935168035).

## Run

```bash
cd apps/stack-diagram-studio
bun install
bun run dev
```

Also: `bun test`, `bun run lint`, `bun run build`.

## Features

- Live keyword parser (~40 catalog entries), including `X on Y` hosting phrases
- Layered SVG layout with inferred edges; drag tiles (8px grid) and reset layout
- Presets, app + diagram light/dark themes, URL hash state
- Export standalone HTML and 2× PNG (optional transparent background)
- Generic lucide category icons and neutral monogram badges (no vendor logos)

## Pinned dependencies (publish dates)

Verified with `npm view <pkg>@<ver> time.modified` before install (repo `minimumReleaseAge` = 72h).

| Package | Version | Published (UTC) |
| --- | --- | --- |
| react | 19.3.1 | 2026-10-31 |
| react-dom | 19.3.1 | 2026-10-31 |
| vite | 8.3.5 | 2026-10-21 |
| @vitejs/plugin-react | 6.1.2 | 2026-11-02 |
| typescript | 6.0.3 | 2026-11-03 |
| tailwindcss | 4.3.3 | 2026-11-02 |
| @tailwindcss/vite | 4.3.3 | 2026-11-02 |
| @types/react | 19.3.0 | 2026-10-04 |
| @types/react-dom | 19.3.0 | 2026-10-04 |
| @types/bun | 1.4.4 | 2026-10-23 |
| @types/node | 24.19.2 | 2026-10-28 |
| oxlint | 1.90.0 | 2026-11-03 |
| lucide-react | 1.61.0 | 2026-11-03 |
| cn | 0.5.0 | 2026-11-02 |
| shadcn (CLI) | 4.22.1 | 2026-10-27 |
| @base-ui/react | 1.9.0 | (shadcn ui peer) |
| @hugeicons/core-free-icons | 4.4.0 | (shadcn preset) |
| @hugeicons/react | 1.1.10 | (shadcn preset) |

Exact versions are pinned in `package.json` (no `^` / `~`).

## Licenses (direct runtime deps)

| Package | License |
| --- | --- |
| react / react-dom | MIT |
| vite | MIT |
| typescript | Apache-2.0 |
| tailwindcss / @tailwindcss/vite | MIT |
| lucide-react | ISC |
| cn, clsx, tailwind-merge, class-variance-authority | MIT |
| @base-ui/react | MIT |
| @hugeicons/* | MIT |

## Limits

- Keyword parser only; unknown tokens become editable “Unknown” tiles
- Single diagram per page; no React component export or cloud deploy in this MVP
- Diagram layout is heuristic, not a full graph editor
