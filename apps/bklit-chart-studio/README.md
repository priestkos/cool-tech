# Bklit Chart Studio

**Unofficial demo. Not Bklit Studio and not affiliated with Bklit.**

One-page studio for [Bklit UI](https://github.com/bklit/bklit-ui): paste or pick a dataset and preview **area**, **candlestick**, **funnel**, and **radar** charts side by side. Includes a light/dark theme toggle and a per-chart “copy install command” button.

Source buzz: [uixmat on X](https://x.com/uixmat/status/2115528918748774462).

## Run locally

```bash
cd apps/bklit-chart-studio
bun install
bun run dev
```

Then open the URL Vite prints (default `http://localhost:5173`). No network calls are required at runtime; chart sources are committed under `src/components/charts/`.

## How the charts were installed

Install path: **`shadcn@4.22.1 add`** against a **local registry build** of Bklit UI at commit **`f028db249b9b95a895e071d9d2911cce5b7de40b`** (`f028db2`, committed **2026-10-26T15:23:06+01:00**). The hosted registry at `ui.bklit.com` was **not** used for code generation (it tracks latest `main`).

Steps used for this demo:

1. Clone `bklit-ui` outside this repo and `git checkout f028db2`.
2. `cd packages/ui && npx shadcn@4.22.1 build registry.json --output /tmp/bklit-r`
3. Serve `/tmp/bklit-r` on `http://127.0.0.1:3100/r/`.
4. Point `components.json` at the local registry, pre-install pinned npm deps, then  
   `npx shadcn@4.22.1 add @bklit/area-chart @bklit/candlestick-chart @bklit/funnel-chart @bklit/radar-chart --yes --overwrite`
5. Verified installed files match the built registry JSON (e.g. `area-chart.tsx` byte-identical to registry content).
6. Restored `components.json` to `"@bklit": "https://ui.bklit.com/r/{name}.json"` for honest copy buttons.

Bklit chart components are **MIT** — see `THIRD_PARTY_LICENSES/bklit-ui-LICENSE.txt`. **Bklit Studio** (`packages/studio`, ui.bklit.com/studio) is **proprietary**; this app does not use or imitate it.

## Pinned versions (npm publish time, 72h+ rule checked 2026-10-30)

| Package | Version | Published (UTC) |
|---------|---------|-----------------|
| `motion` | 12.27.0 | 2026-01-18 |
| `d3-array` | 3.2.4 | 2023-05-30 |
| `d3-shape` | 3.2.0 | 2022-12-20 |
| `@visx/curve` | 4.0.0 | 2026-06-11 |
| `@visx/event` | 4.0.0 | 2026-06-11 |
| `@visx/gradient` | 4.0.0 | 2026-06-11 |
| `@visx/grid` | 4.0.0 | 2026-06-11 |
| `@visx/group` | 4.0.0 | 2026-06-11 |
| `@visx/responsive` | 4.0.0 | 2026-06-11 |
| `@visx/scale` | 4.0.0 | 2026-06-11 |
| `@visx/shape` | 4.0.0 | 2026-06-11 |
| `@number-flow/react` | 0.6.2 | 2026-07-18 |
| `clsx` | 2.1.1 | 2024-04-23 |
| `tailwind-merge` | 3.7.0 | 2026-09-12 |
| `cn` | 0.5.0 | 2026-10-16 |
| `react` / `react-dom` | 19.3.1 | 2026-10-14 |
| `vite` | 8.3.5 | 2026-10-21 |
| `@vitejs/plugin-react` | 6.1.2 | 2026-10-05 |
| `tailwindcss` / `@tailwindcss/vite` | 4.3.3 | 2026-07-16 |
| `lucide-react` | 1.61.0 | 2026-10-21 |
| `shadcn` (CLI) | 4.22.1 | 2026-10-18 |
| `@types/bun` | 1.4.4 | 2026-10-23 |

**Bklit UI commit:** `f028db249b9b95a895e071d9d2911cce5b7de40b` — https://github.com/bklit/bklit-ui/commit/f028db249b9b95a895e071d9d2911cce5b7de40b

## Dataset format & mapping

- **Input:** CSV with header row, or a JSON array of flat objects (max **200** rows).
- **Samples:** daily OHLC prices, signup funnel (`stage`, `value`), product comparison (label + numeric metrics).
- **Mapping:** auto-detected columns; editable selects for date, area values, OHLC fields, funnel stage/value, and radar series label. Radar uses all numeric columns except date and the label column.
- Charts show **“Needs columns: …”** when mapping cannot produce valid data.

## Copy install command caveat

Each chart card copies:

```bash
npx shadcn@latest add @bklit/<chart-name>
```

(as in Bklit’s installation docs). That command pulls from **Bklit’s hosted registry (latest `main`)**, not from commit `f028db2`. Use the collapsible **“Reproduce this build”** snippet in the app (or the install steps above) to match this demo.

## License table

| Component | License | Notes |
|-----------|---------|--------|
| Bklit chart registry (`src/components/charts/*`) | MIT | Copyright (c) 2026 uixmat — see `THIRD_PARTY_LICENSES/bklit-ui-LICENSE.txt` |
| Bklit Studio | Proprietary | Not used in this demo |
| `@bklitui/icons` | UNLICENSED | Not installed (depends on proprietary icon pack) |
| shadcn/ui primitives (`src/components/ui/*`) | MIT | Via shadcn CLI |
| App code (`src/` outside charts) | Same as monorepo | Demo-only |

## Tests

```bash
bun test
```

Covers CSV/JSON parsing and chart data mappers (including missing-column cases).
