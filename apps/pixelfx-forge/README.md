# PixelFX Forge

**Unofficial community demo.** Not affiliated with patch-gg / Patch, Hugo Duprez or Sprite Fusion. Effects by [pixelfx](https://github.com/patch-gg/pixelfx) (MIT).

One-page browser playground for patch-gg/pixelfx: browse 244 code-driven pixel-art game effects, recolor palettes, play acted effects in an arena, and export PNG sprite sheets with Aseprite-style JSON—all offline after install.

Source buzz: https://x.com/Mnilax/status/2117326790930907173

## Run

```bash
cd apps/pixelfx-forge
bun install
bun run dev
```

Also: `bun test`, `bun run lint`, `bun run build`.

## pixelfx pin

Git dependency (not on npm):

- `github:patch-gg/pixelfx#a84159688af3ca37a4be05a0d422b94451b2e24e`
- Commit date: **2026-10-31** (pixelfx 0.3.0 — “give the effects a body that performs them”)

## Caveats

- Effects drawn on the body (frost, poison, scan lines, etc.) are fitted to pixelfx’s stock dummy character.
- We do **not** use the upstream gallery’s Patch Pixel font (not MIT).

## Credits & license

| Component | License | Copyright / notice |
|-----------|---------|-------------------|
| pixelfx | MIT | Copyright (c) 2026 Patch; Copyright (c) 2026 Hugo Duprez |
| Sprite Fusion (referenced in pixelfx NOTICE) | — | Hugo Duprez |
| Hollow Crown timing reference in pixelfx | MIT | rehan-remade |

Full MIT texts: see pixelfx `LICENSE` and `NOTICE.md` in the pinned commit.

## Pinned dependencies (publish dates)

Verified ≥72h before install on 2026-11-05 via `npm view <pkg>@<ver> time`.

| Package | Version | Published (UTC) |
|---------|---------|-----------------|
| react | 19.3.1 | 2026-10-31 |
| react-dom | 19.3.1 | 2026-10-31 |
| @types/react | 19.3.0 | 2026-09-09 |
| @types/react-dom | 19.3.0 | 2026-09-09 |
| vite | 8.3.5 | 2026-10-21 |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 |
| typescript | 6.0.3 | 2026-11-04 |
| tailwindcss | 4.3.3 | 2026-07-16 |
| @tailwindcss/vite | 4.3.3 | 2026-07-16 |
| @types/bun | 1.4.4 | 2026-10-23 |
| @types/node | 24.19.2 | 2026-10-28 |
| oxlint | 1.90.0 | 2026-10-27 |
| lucide-react | 1.61.0 | 2026-10-21 |
| cn | 0.5.0 | 2026-10-16 |
| shadcn | 4.22.1 | 2026-10-18 |
| @base-ui/react | 1.9.0 | (via shadcn lock) |
| @hugeicons/core-free-icons | 4.4.0 | (via shadcn lock) |
| @hugeicons/react | 1.1.10 | (via shadcn lock) |
| class-variance-authority | 0.7.1 | (via shadcn lock) |
| clsx | 2.1.1 | (via shadcn lock) |
| tailwind-merge | 3.7.0 | (via shadcn lock) |
| tw-animate-css | 1.4.0 | (via shadcn lock) |

`bunfig.toml` keeps `[install] minimumReleaseAge = 259200`. Git pixelfx pin is the SHA guarantee for the library itself.

## Features

- Searchable category grid with static thumbnails
- Stage: play/pause, scrub, loop, speed, scale, flip, seed, backgrounds
- Palette presets (ice, fire, toxic/poison, holy, shadow) and per-swatch edits
- Arena (`createAct`) with body/target toggles; Space or click to replay
- Browser sprite-sheet PNG + JSON export
- URL hash state for effect + tuning options
