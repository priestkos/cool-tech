# Alembic Ornament Studio

**Unofficial community demo. Not affiliated with Lauri Paronen or Alembic.**

One-page, browser-only studio for [`@lauriparonen/alembic-ornaments`](https://www.npmjs.com/package/@lauriparonen/alembic-ornaments): seeded woodcut ornaments and frames drawn as SVG, where `{ preset, seed }` is the whole drawing. Pick a frame and divider presets, change the seed, frame weight and ink colour, preview them on a card or quote, and export SVG or PNG.

- Release buzz: https://x.com/foodofthegods3/status/2116423919137632431  
- Original: https://x.com/foodofthegods3/status/2115800524591169623  
- Upstream: https://github.com/lauriparonen/alembic-ornaments  
- Official playground (reference only): https://alembic.space/ornaments  

Exported images are drawings produced by the MIT-licensed generator. Credit in the UI: **Ornaments by alembic-ornaments (Lauri Paronen, MIT)**.

## Run

```bash
cd apps/alembic-ornament-studio
bun install
bun run dev
```

Other scripts: `bun test`, `bun run build`, `bun run preview`, `bun run lint`.

Everything works offline after install (no remote fonts, images, analytics, or API keys).

## Controls

| Control | Maps to |
| --- | --- |
| Frame preset | `border` / `block` / `corners` → `fitFrame` / `<Framed>` |
| Seed | Frame variation (deterministic) |
| Frame weight slider (12–64 px) | `size` for `fitFrame` / `<Framed>` — this is the honest “density” knob (there is **no** library `density` parameter) |
| Corners → clear mode | `clear: 'ink' \| 'edges'` |
| Ink colour | Passed to React components and resolved in exports |
| Card / Quote | Layout of title + body in the preview and export |
| Divider ornament | Optional `<Ornament>` with its own preset + seed |
| Resize handle | Changes preview box; frame follows via `<Framed>` |
| URL query string | Full studio state, normalised with `normalizeFrame` / `normalizeParams` |

**Deferred:** proportional print mode using `generateFrame` + `scale` (0.6–1.6) — not exposed in this MVP.

Sample quote text uses short public-domain lines (editable in the UI).

## Export

- **SVG:** One standalone document at the preview’s pixel size: background rect (unless omitted), nested frame SVG from `fitFrame` (correct `viewBox`, scaled to W×H), optional divider ornament, and text as `<text>` with a generic serif stack. Root `color` resolves `currentColor` in ornament markup. Includes `xmlns`. Text renders with the viewer’s installed fonts (not embedded).
- **PNG:** Same SVG rasterised via canvas at **2×**; optional transparent background (skips the background rect).
- Filenames: `alembic-{preset}-seed-{seed}.svg` / `.png`.

## Pinned dependencies (publish dates from `npm view … time` on 2026-11-03 UTC)

| Package | Version | Published (UTC) | License |
| --- | --- | --- | --- |
| `@lauriparonen/alembic-ornaments` | 0.1.0 | 2026-10-31 | MIT |
| `react` | 19.3.1 | 2026-10-14 | MIT |
| `react-dom` | 19.3.1 | 2026-10-14 | MIT |
| `@types/react` | 19.3.0 | 2026-09-09 | MIT |
| `@types/react-dom` | 19.3.0 | 2026-09-09 | MIT |
| `vite` | 8.3.5 | 2026-10-21 | MIT |
| `@vitejs/plugin-react` | 6.1.2 | 2026-11-02 | MIT |
| `typescript` | 6.0.3 | 2026-04-16 | Apache-2.0 |
| `tailwindcss` | 4.3.3 | 2026-07-16 | MIT |
| `@tailwindcss/vite` | 4.3.3 | 2026-11-02 | MIT |
| `@types/bun` | 1.4.4 | 2026-10-23 | MIT |
| `lucide-react` | 1.61.0 | 2026-10-21 | ISC |
| `shadcn` | 4.22.1 | 2026-10-18 | MIT |
| `@base-ui/react` | 1.9.0 | 2026-10-09 | MIT |
| `@hugeicons/react` | 1.1.10 | 2026-08-21 | MIT |
| `@hugeicons/core-free-icons` | 4.3.5 | 2026-09-21 | MIT |
| `class-variance-authority` | 0.7.1 | 2024-11-26 | Apache-2.0 |
| `clsx` | 2.1.1 | 2024-04-23 | MIT |
| `cn` | 0.5.0 | 2026-10-16 | MIT |
| `sonner` | 2.0.8 | 2026-08-09 | MIT |
| `tailwind-merge` | 3.7.0 | 2026-09-12 | MIT |
| `tw-animate-css` | 1.4.0 | 2025-09-24 | MIT |
| `oxlint` | 1.90.0 | 2026-10-27 | MIT |
| `@types/node` | 24.19.2 | 2026-10-09 | MIT |

Install gate: `bunfig.toml` sets `minimumReleaseAge = 259200` (72 hours). `@lauriparonen/alembic-ornaments@0.1.0` was pinned because it cleared that gate on 2026-11-03; `@vitejs/plugin-react@6.1.2` and `@tailwindcss/vite@4.3.3` are pinned to match `apps/spark-radix-explorer` per demo brief.

Third-party license file: `THIRD_PARTY_LICENSES/alembic-ornaments-LICENSE.txt`.

## Not verified / limits

- PNG export depends on browser canvas + SVG `Image` loading (same-origin blob URLs only here).
- Server-side rendering of `<Framed>` is not used; preview frames appear after hydration (library behaviour).
- No embedded fonts in SVG exports.
