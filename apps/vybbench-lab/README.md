# VybBench Lab

Unofficial community demo. Not affiliated with, or endorsed by, Coco Labs or Vyb. Scores are from the published VybBench 1.0 results (Apache-2.0 code / CC-BY-4.0 dataset). Viewer images are illustrative mocks.

One-page, browser-only scoreboard and fidelity viewer inspired by [VybBench](https://github.com/cocolabsai/vybbench). This app does **not** run the Python scorer, download HuggingFace data, or call image-model APIs.

VybBench was built by Coco Labs, the makers of Vyb.

## Run

```bash
cd apps/vybbench-lab
bun install
bun run dev
```

Scripts: `bun test`, `bun run build`, `bun run lint`.

## Links

- Buzz: [Anurag on X](https://x.com/anurahk/status/2118423168612528242)
- Upstream (Apache-2.0): https://github.com/cocolabsai/vybbench
- Dataset (CC-BY-4.0): https://huggingface.co/datasets/cocolabs/vybbench
- Research: https://cocolabs.ai/research/vybbench
- Launch post: https://cocolabs.ai/blog/introducing-vybbench

## What this demo shows

| Area | Content |
|---|---|
| Scoreboard | Font / Color / Edit tabs with sortable tables from bundled `vybbench-1.0-scores.json` (October 2026 run) |
| Charts | Client-side SVG/CSS bar charts per metric family |
| Fidelity viewer | Mock before/after panels (bundled SVGs) + optional edit diff-heat overlay |
| Model drawer | Three metric summaries + disclosure |
| URL hash | `#tab=&model=&scenario=&diff=` restored on reload |

## Licensing

| Item | License |
|---|---|
| VybBench benchmark code (Coco Labs) | Apache-2.0 |
| VybBench dataset / published scores | CC-BY-4.0 |
| This demo app | Same as parent repo |

No Coco Labs or Vyb logos; mock panels are original fiction.

## Pinned dependencies (72 h gate checked 2026-11-06)

| Package | Version | Published (UTC) |
|---|---|---|
| react / react-dom | 19.3.1 | 2026-10-14 |
| @types/react / @types/react-dom | 19.3.0 | 2026-09-09 |
| vite | 8.3.5 | 2026-10-21 |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 |
| typescript | 6.0.3 | 2026-04-16 (Apache-2.0) |
| tailwindcss / @tailwindcss/vite | 4.3.3 | 2026-07-16 |
| @types/bun | 1.4.4 | 2026-10-23 |
| @types/node | 24.19.2 | 2026-10-09 |
| oxlint | 1.90.0 | 2026-10-27 |
| shadcn (CLI) | 4.22.1 | 2026-10-18 |
| lucide-react | 1.61.0 | 2026-10-21 (ISC) |
| cn | 0.5.0 | 2026-10-16 |
| @base-ui/react | 1.9.0 | 2026-10-09 |
| @fontsource-variable/inter | 5.3.0 | 2026-07-19 |
| @hugeicons/core-free-icons | 4.4.0 | 2026-10-18 |
| @hugeicons/react | 1.1.10 | 2026-09-08 |
| class-variance-authority | 0.7.1 | 2024-12-09 |
| clsx | 2.1.1 | 2024-04-23 |
| tailwind-merge | 3.7.0 | 2026-10-23 |
| tw-animate-css | 1.4.0 | 2026-09-15 |

Additional shadcn registry deps are exact-pinned in `package.json` / `bun.lock` under the repo `minimumReleaseAge` gate.

## Tests

Critical logic only: fixture parse, ranking sort polarity, URL hash round-trip, chart data builders.
