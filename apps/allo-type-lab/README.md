# Allo Type Lab

Local offline playground for the real [Allo](https://allo.joshpuckett.me) variable typeface by Josh Puckett — axes, OpenType features, contextual arrows, and UI personality presets. Uses **allo-font@1.0.0** (SIL OFL 1.1) only; font files bundle with the app (no CDN, no API keys).

## Commands

```bash
cd apps/allo-type-lab
bun install
bun run dev      # http://127.0.0.1:5173
bun test
bun run typecheck
bun run build
bun run preview
```

## Architecture

- `src/lib/` — `font-variation-settings` / `font-feature-settings` builders, presets, copy-CSS export
- `src/features/` — Axis playground, feature toggles, contextual `calt` box, UI preview, About/credits
- `allo-font/allo.css` — real WOFF2 faces from the npm package (see [Allo repo](https://github.com/joshpuckett/allo) for upstream docs)

## Credits

- Typeface: [Allo](https://allo.joshpuckett.me) · [GitHub](https://github.com/joshpuckett/allo) · [Launch](https://x.com/joshpuckett/status/2122329345670988258)
- npm pin: `allo-font@1.0.0` (commit `4bef023e21d938ab2b6982d3dda5fa334e1e5a9b`)
- License: SIL OFL 1.1 — full text in `THIRD_PARTY_LICENSES.md` and `public/OFL.txt`

## Verify (Nov 2026)

| Check | Result |
| --- | --- |
| `bun test` | 6 pass |
| `bun run typecheck` | clean |
| `bun run build` | JS ~99.7 kB gzip (see build log) |

Dependency pins and age evidence: `dependency-evidence.json`.