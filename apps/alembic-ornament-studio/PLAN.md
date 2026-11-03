# Alembic Ornament Studio — PLAN

**Goal:** A one-page studio where you pick a seeded woodcut frame and ornaments from `@lauriparonen/alembic-ornaments`, tweak seed, frame weight and ink colour, see them framing a card or a quote, and export the result as SVG or PNG.

Source buzz: https://x.com/foodofthegods3/status/2116423919137632431 (release, Oct 31 2026) and https://x.com/foodofthegods3/status/2115800524591169623. Code: https://github.com/lauriparonen/alembic-ornaments, npm `@lauriparonen/alembic-ornaments@0.1.0` (MIT, Lauri Paronen). Unofficial community demo, not affiliated with Lauri Paronen or Alembic.

## Single-user MVP
1. Preview stage: a resizable card (or quote block) wrapped in `<Framed>` with the chosen frame preset (border / block / corners), seed, frame weight (`size` px), `clear` mode and ink colour.
2. Controls panel: frame preset select, seed number input with prev/next/random buttons, frame-weight slider, ink colour swatches + picker, Card/Quote layout switch, editable title and body text, divider ornament (vine / frieze / garland / sprig via `<Ornament>`) on/off with its own seed.
3. Deterministic state: all params live in the URL, normalised with `normalizeParams`/`normalizeFrame`, so a link redraws the same piece.
4. Export: standalone SVG (frame + ornaments + text, ink resolved) and PNG (2x, optional transparent background), file names with preset and seed.
5. Preset strip: small live thumbnails of every frame and ornament for the current seed (from `PRESETS`/`FRAMES` blurbs).
6. Header: links to the X posts, repo, npm and playground; "Unofficial community demo" line; light/dark toggle.

**Out of scope:** proportional "print" mode with `generateFrame` (deferred), text flowing around ornaments (`ornamentOutline`), multi-page layouts, saving to an account, sharing service, fonts embedded in the SVG, deploy.

## Tasks (vertical slices)
1. Check the start time and the 3-day rule for every pinned package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Preview stage: `<Framed>` card with frame preset + seed + size + colour wired to state; resize handle.
3. Controls panel, Card/Quote layouts, divider ornaments, URL state with normalisation.
4. SVG export composer + PNG rasteriser + downloads; verify the files open correctly.
5. Preset strip, header, light/dark.
6. Tests (state round-trip, export composer, naming), README (pins with dates, license table, density mapping, honest notes), screenshot and video, PR.

## Stack
- `@lauriparonen/alembic-ornaments@0.1.0`: the tech being demoed; core functions for export, React components for the live preview.
- Vite + React + TS: least wiring for a client-only page.
- shadcn/ui minimalist preset (card, button, select, slider, input, textarea, toggle-group, tooltip, sonner): repo standard for the controls.

## Deferred
- Proportional print mode (`generateFrame` + `frameInset`, scale 0.6–1.6): useful for posters, not needed to show the library.
- Text wrapping around ornaments with `ornamentOutline`: nice, but its own project.
- Embedding fonts into exported SVG: adds size and licensing questions.
- Deploy preview: optional per AGENTS.md; later on the shared Pages project.
