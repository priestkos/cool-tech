# Hyper Elements Studio

Local offline demo of [Hyper Elements](https://hyperelements.dev/) (`@hyper-elements/react@0.3.1`, MIT, Copyright (c) 2025 Unlayer, Inc.). One shared newsletter/card tree is wrapped in the four official roots (`Email`, `Page`, `Document`, `Canvas`) and previewed in Email / Web / PDF / Image tabs, with `validate()` diagnostics and an `outline()` layout inspector.

**Pinned upstream:** npm `@hyper-elements/react@0.3.1`, GitHub release [v0.3.1](https://github.com/hyper-elements/hyper-elements/releases/tag/v0.3.1), commit `571ec52fef7285f583e53123bae71594d886f88b`.

Visual email-client emulators are intentionally omitted: `@hyper-elements/email-clients` has no version ≥72h old at launch (see app `dependency-evidence.json`).

## Commands

```bash
cd apps/hyper-elements-studio
bun install
bun run dev      # http://localhost:5173
bun test
bun run typecheck
bun run build
bun run preview  # production build + API middleware
```

## Architecture

- **Shared tree:** `server/card-tree.tsx` builds the card; `shared/card-draft.ts` holds editor state.
- **Roots:** Same inner column for all four roots; tab picks render target.
- **Server paths:** `server/hyper-api.ts` Vite middleware handles `validate`, `outline`, `render`, `renderPdf`, `renderImage` — PDF/image use bundled Arimo TTF + local PNG (`server/assets.ts`). No network at runtime.
- **UI:** React + shadcn; previews use sandboxed iframes (HTML) or blob URLs (PDF/PNG/SVG).

## Bundled assets

- `src/assets/Arimo-*.ttf` — Croscore Arimo (Apache-2.0, Google)
- `src/assets/card-logo.png` — local fixture for `Image` src map

## Licenses preserved in-repo

- Hyper Elements (MIT), `@react-pdf/renderer` (MIT), satori / `@resvg/resvg-js` (MPL-2.0), shadcn registry components (MIT), Arimo (Apache-2.0).
