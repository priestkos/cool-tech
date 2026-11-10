# BenchUp Board Lab

Independent offline **three.js** lab that re-creates a BenchUp-style board workflow: draw a typed-size rectangle on a grid, **Push/Pull** thickness, edge-snap boards into a simple shelf, cut list with total board-feet, local autosave, JSON save/load, and OBJ export.

This is **not** the official [BenchUp](https://benchup3d.github.io/editor/) editor. We do not ship BenchUp/KetchUp Rust, WASM, or source. The upstream project is MIT, Copyright (c) 2026 BenchUp contributors; documentation snapshot [v0.6.4](https://github.com/BenchUp3D/editor/releases/tag/v0.6.4) (`290b167`). Formerly KetchUp.

**three.js** is MIT, Copyright © 2010–2026 three.js authors.

## Commands

```bash
cd apps/benchup-board-lab
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

## Architecture

| Area | Role |
|------|------|
| `src/features/board/model.ts` | Dimensions, snap, board-feet, JSON |
| `src/features/board/scene.ts` | Grid, boards, OrbitControls, raycast |
| `src/features/board/export.ts` | OBJ via `three/addons/exporters/OBJExporter.js` |
| `src/features/board/useBoardLab.ts` | React state + `localStorage` autosave |
| `src/components/ui/*` | shadcn minimalist (from pinned sibling demos) |

1 in grid unit = 1 inch. Board-feet = T×W×L ÷ 144.

## Out of scope

- `.skp` import, official BenchUp WASM, accounts, runtime network
