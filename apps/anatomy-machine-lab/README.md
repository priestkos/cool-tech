# Anatomy Machine Lab

Unofficial community demo. Not affiliated with wheresryan22 or Anatomy. The real Anatomy is an agent skill that generates machines from a question; this page shows three hand-built machines and does not run it.

Source buzz: [sumitdesk on X](https://x.com/sumitdesk/status/2117563737968369925). Idea inspired by [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy). Nothing was copied from the upstream project.

## Run locally

```bash
cd apps/anatomy-machine-lab
bun install
bun run dev
```

Also verified: `bun test`, `bun run lint`, `bun run build`.

## What you get

- Three interactive isometric SVG machines (clock gearbox, pour-over coffee, hand pump) with deterministic `state(t)` simulations.
- Timeline controls: play/pause, speed (0.25×–4×), scrub, reset.
- Hover/focus highlights with callouts and a parts list (keyboard accessible).
- Optional canvas particle effects (off when `prefers-reduced-motion` is set); works fully without effects.
- Light/dark theme tied to the diagram palette.

## Pinned dependencies (publish dates)

All installs go through `bunfig.toml` with `minimumReleaseAge = 259200` (72 hours).

| Package | Version | Published (UTC) |
| --- | --- | --- |
| react | 19.3.1 | 2026-10-14 |
| react-dom | 19.3.1 | 2026-10-14 |
| vite | 8.3.5 | 2026-10-21 |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 |
| typescript | 6.0.3 | 2026-04-16 |
| tailwindcss | 4.3.3 | 2026-07-16 |
| @tailwindcss/vite | 4.3.3 | 2026-07-16 |
| @types/react | 19.3.0 | 2026-09-09 |
| @types/react-dom | 19.3.0 | 2026-09-09 |
| @types/bun | 1.4.4 | 2026-10-23 |
| @types/node | 24.19.2 | 2026-10-09 |
| oxlint | 1.90.0 | 2026-10-27 |
| lucide-react | 1.61.0 | 2026-10-21 |
| cn | 0.5.0 | 2026-10-16 |
| shadcn (CLI) | 4.22.1 | 2026-10-18 |
| @base-ui/react | 1.9.0 | 2026-10-09 |
| @hugeicons/core-free-icons | 4.3.5 | 2026-09-21 |
| @hugeicons/react | 1.1.10 | 2026-08-21 |
| class-variance-authority | 0.7.1 | 2024-11-26 |
| clsx | 2.1.1 | 2024-04-23 |
| tailwind-merge | 3.7.0 | 2026-09-12 |
| tw-animate-css | 1.4.0 | 2025-09-24 |

Exact resolved versions live in `package.json` and `bun.lock`.

## Licenses (direct runtime deps)

| Package | License |
| --- | --- |
| react / react-dom | MIT |
| vite / @vitejs/plugin-react | MIT |
| typescript | Apache-2.0 |
| tailwindcss / @tailwindcss/vite | MIT |
| lucide-react | ISC |
| cn | MIT |
| @base-ui/react | MIT |
| shadcn CLI | MIT |

## Limits

- Browser-only MVP; no LLM, backend, analytics, or remote assets after install.
- Three fixed machines — not generative Anatomy.
- Effects are decorative 2D canvas particles, not a WebGL requirement.
