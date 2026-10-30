# Bklit Chart Studio — PLAN

**Goal:** A one-page studio where you paste or pick a dataset and instantly see it as Bklit area, candlestick, funnel and radar charts side by side, with a theme toggle and a copy-install button per chart.

Source buzz: https://x.com/uixmat/status/2115528918748774462 (@uixmat, Oct 2026). Code: https://github.com/bklit/bklit-ui @ f028db2 (chart components MIT). Unofficial demo, not Bklit Studio (which is proprietary).

## Single-user MVP
1. Charts installed by `shadcn@4.22.1 add` from a Bklit registry built locally at commit f028db2: area-chart, candlestick-chart, funnel-chart and radar-chart. Generated files committed under src/components/charts.
2. Data panel: three sample datasets (a daily price series with date/open/high/low/close/volume, a signup funnel, and a product comparison with several metrics), plus a textarea to paste CSV or a JSON array of objects (max 200 rows), with readable parse errors.
3. Column mapping: auto-detected, editable selects for the label/date column, the value columns (area and radar), the open/high/low/close columns (candlestick) and the stage/value columns (funnel).
4. A 2×2 grid of chart cards, all fed from the same parsed table. Each card has a title, the live Bklit chart, and a clear "needs columns: …" empty state when the mapping can't feed it.
5. Each card has a "Copy install command" button (`npx shadcn@latest add @bklit/<name>`) with a toast and the hosted-registry caveat.
6. Header: a light/dark theme toggle that the charts follow through Bklit's CSS variables, links to the repo, docs and X post, and the "Unofficial demo, not Bklit Studio" line.

**Out of scope:** radial and the other 60 registry items, anything from Bklit main after f028db2, Bklit Studio features, file upload, saving or sharing datasets, exporting images, auth, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for the Bklit commit and every pinned package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Build the Bklit registry at f028db2 in /tmp, serve it on localhost:3100 temporarily, and run `shadcn add` for the four charts. Prove the files came from the local build. Render the area chart with hard-coded sample data.
3. Dataset parser (CSV and JSON), the three samples, and the paste box with errors.
4. Column mapping, per-chart mappers and the 2×2 grid with empty states.
5. Theme toggle wired to the `--chart-*` variables, copy-install buttons with the caveat, header links and disclaimer.
6. Tests (parser, mappers), README (pins with dates, commit, install path, license table, caveats), screenshot and video, PR.

## Stack
- Bklit UI @ f028db2 via a local registry build and shadcn@4.22.1: the tech being demoed, installed the way it is meant to be, pinned to a commit at least 3 days old.
- visx 4.0.0, motion 12.27.0 and d3-array/d3-shape: exactly what the Bklit chart items depend on.
- Vite + React + TS: least wiring for a client-only page.
- shadcn/ui minimalist preset (card, button, textarea, select, tabs, sonner/toast, tooltip): repo standard, and already required by the registry flow.

## Deferred
- Radial and other Bklit charts: radial landed on main after the pin (Oct 29); add it once a pinned commit with it is 3+ days old.
- Palette switcher (Ocean, Sunset and the other palettes from theming.mdx): nice, but the theme toggle shows the variable wiring already.
- Share links and image export: need state encoding and canvas capture, not needed to show the charts.
- Deploy preview: optional per AGENTS.md; do it later on the shared Pages project.
