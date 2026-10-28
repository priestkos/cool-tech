# devl.dev Components demo

Single-page showcase for four open-source components from [devl.dev](https://devl.dev) (Sean Brydon): **JSON Explorer**, **Liquid Slider**, **File Tree**, and **Voice Note**. Wired together as a small “agent dev console” with sample data, theme toggle, and File Tree → JSON Explorer linking.

Source buzz: [X post](https://x.com/SeanBrydon13/status/2114768649336869231) · [GitHub](https://github.com/sean-brydon/devl.dev)

## Run

```bash
cd apps/devl-dev-components
bun install
bun run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

## Pinned versions (3-day rule checked 2026-10-28 UTC)

| Package | Version | Published (npm) |
|---------|---------|-----------------|
| `motion` | 14.6.0 | 2026-10-22T08:17:20Z |
| `lucide-react` | 1.61.0 | 2026-10-21T06:12:38Z |
| `shadcn` (CLI) | 4.22.1 | 2026-10-18T18:12:18Z |
| `@base-ui/react` | 1.9.0 | (tooltip peer; pre-3-day at install) |

Dev server stack pins match sibling demos: `react` 19.3.1, `vite` 8.3.4, `tailwindcss` 4.3.3, etc. See `package.json` and `bun.lock`.

## devl.dev source pin

Components copied from commit **`2328dbcb5a6d786e8df3da85a79363a32090b3b1`** (merged to main **`6af98acb0ee874f21d902bf2c78da9ecb9a817dc`** on **2026-10-25T13:20:51Z**). Raw files were fetched from GitHub at that SHA; the live `https://devl.dev/r/*.json` registry URLs are intentionally **not** used (unversioned + AGPL coss ui deps).

## Edits to copied devl component source

We did **not** install coss ui (AGPL). shadcn/ui MIT components stand in for registry deps.

| File | Change |
|------|--------|
| All four in `src/components/devl/` | Added MIT source header (repo, commit, date). Removed `"use client"` (Vite, not Next.js). |
| `json-explorer.tsx` | `TooltipPopup` → `TooltipContent` (shadcn/base-ui tooltip API). Removed `size="sm"` on `InputGroupInput` (conflicts with shadcn `Input` `size` typing). |
| `file-tree.tsx`, `liquid-slider.tsx`, `voice-note.tsx` | No import path changes beyond header / `"use client"`. |

## App CSS additions

`src/index.css` adds `--info`, `--success`, `--warning`, and related foreground tokens used by **Liquid Slider** tones and **File Tree** git status colors (not in the default minimalist preset alone).

## Voice Note

Uses **simulated playback** (no `src` audio file), as in the upstream demo intent.

## License

Demo app code in this folder: same as the monorepo. Copied devl components: MIT — see `THIRD_PARTY_NOTICES.md`.
