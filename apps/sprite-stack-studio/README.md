# Sprite Stack Studio

Local offline studio for the real [danielwh2/sprite-stacking](https://github.com/danielwh2/sprite-stacking) slicer and viewer (MIT, Daniel White). Four orthographic pixel-art views carve into a sprite-stacking strip; the unmodified `viewer.html` handles Turntable, Slice scan, Exploded, Scene, Drive, time of day, weather, and 16-direction export.

This is an **independent demo** in the cool-tech monorepo—not official upstream software.

## Prerequisites

- **Bun** 1.4.x (see root `bunfig.toml` age gate)
- **Python 3.12+** with `venv`

## Setup

```bash
cd apps/sprite-stack-studio
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
bun install
bun run prepare:gallery
```

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Vite UI + Bun slicer API (one command) |
| `bun run build` | Production build |
| `bun run typecheck` | TypeScript |
| `bun test` | Bun tests (hashes, CLI, API) |
| `bun run check:python` | Upstream `tests/check.py` self-check |
| `bun run prepare:gallery` | Regenerate original sample sheets + pre-carve gallery |

## Architecture

1. React shell (gallery, upload, slicer settings, About).
2. `server/index.ts` accepts PNG/WebP uploads and spawns the vendored `views_to_slices.py` with argv (no shell interpolation).
3. CLI writes slice strip + self-contained HTML via `build_html_viewer` (embeds data in `viewer.html`).
4. UI iframes that HTML — **no rewrite** of the rasterizer, Scene, Play, or export code.

Sources were obtained by checking out commit `6fecdfd0d6e5a0595f979550e05f4b1fcde550fe` from GitHub (not `npx skills add`). See `dependency-evidence.json` and `THIRD_PARTY_LICENSES`.

Launch context: https://x.com/dwhitedesign/status/2123928042711958000

Gallery 4-view sheets are **original demo assets** created for this app (see `scripts/generate_samples.py`), not files from the upstream repo.