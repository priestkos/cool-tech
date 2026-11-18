# Stageshow Moments

Community lab for [Benji Taylor](https://benji.org/)’s [Stageshow](https://benji.org/stageshow) using the **real MIT React kit**, vendored from [benjitaylor/skills](https://github.com/benjitaylor/skills) at tag **`stageshow-v1.1.1`** (commit [`299140fafd08df55a9c234e610c3f64af3f45531`](https://github.com/benjitaylor/skills/commit/299140fafd08df55a9c234e610c3f64af3f45531)). Fictional brands only; not affiliated with Benji Taylor.

Buzz: [X post](https://x.com/benjitaylor/status/2116593247854453244) · Kit path: `vendor/stageshow/kit/` · Provenance: `vendor/stageshow/UPSTREAM.md` · License: `THIRD_PARTY_LICENSES/stageshow-LICENSE.txt`

## What changed in this remake

Previously this demo followed the Stageshow **skill** with hand-rolled CSS and a custom timeline. It now imports the upstream **`Stage` / `Act` API**, motion helpers (`Count`, `Roll`, …), and kit chrome (`Window`, `Thread`, `Button`, …) directly from the vendored kit.

## Commands

```bash
cd apps/stageshow-moments
bun install
bun run dev      # Vite dev server (default http://localhost:5173)
bun run typecheck
bun test         # registry + vendored ease/measure + view mode
bun run build    # production build
```

Last production build (2026-11-18): main JS **~147.1 kB gzip** (`index-*.js`).

## Bento tile table

| Tile | Span | Kind | The one thing | Words |
| --- | --- | --- | --- | --- |
| Wavelet | 2 × 1 | Hero UI | Cursor presses play; track moves to Playing | “Press play” + one sentence |
| Dayline | 1 × 1 | Component | Accept invite; event fills its slot | “Accept invite” + one sentence |
| Tallypay | 1 × 1 | Component | Pay resolves; receipt satellite appears | “Pay & receipt” + one sentence |
| Natter | 1 × 1 | Component | Reply lands with Delivered + reaction | “Reply lands” + one sentence |
| Checkout speed | 1 × 1 | Stat | Fictional “2.1 s median checkout” | “Up to” + number + label |

Each animated tile is a kit `Stage` with an `Act` script; the stat tile is a static `Stage`.

## Pinned app dependencies (≥72h before launch)

| Package | Version |
| --- | --- |
| react / react-dom | 19.3.1 |
| vite | 8.3.5 |
| @vitejs/plugin-react | 6.1.2 |
| typescript | 6.0.3 |
| tailwindcss / @tailwindcss/vite | 4.3.3 |
| shadcn (dev) | 4.22.1 |
| @base-ui/react | 1.9.0 |
| lucide-react | 1.61.0 |

`bunfig.toml` sets `[install] minimumReleaseAge = 259200`.

## Credit

- **Stageshow kit** — MIT © 2026 Benji Taylor ([`stageshow/LICENSE`](vendor/stageshow/LICENSE))
- **Lab UI** — shadcn/ui minimalist preset (MIT)