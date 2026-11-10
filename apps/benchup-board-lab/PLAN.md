# BenchUp Board Lab — plan

## Goal

Independent three.js web lab that re-creates a BenchUp-style board workflow offline: typed rectangle on a grid, Push/Pull thickness, edge snapping, cut list with board-feet, autosave, JSON, and OBJ export.

## Single-user MVP

- One local user, no accounts, no API keys, no runtime network.
- shadcn side panel + full-width 3D canvas.

**Explicitly out of scope:** Official BenchUp/KetchUp Rust/WASM source, `.skp` import, multi-user sync, cloud deploy.

## Vertical slices

1. **Footprint + extrusion** — Grid, raycast placement with typed length/width, Push/Pull thickness readout, board in app state.
2. **Shelf + panel** — Edge snap, multiple boards, cut list and total board-feet, localStorage autosave, JSON save/load.
3. **Export + credit** — OBJ via `three/addons/exporters/OBJExporter.js`, README/UI credit to BenchUp (independent recreation).

## Stack (rationale)

| Piece | Why |
|-------|-----|
| Bun + Vite 8.3.5 | Monorepo demo convention; fast local dev |
| React 19 + TypeScript 6 | Same proven pins as sibling demos |
| three@0.187.0 | Grid, raycast, extrusion meshes, OrbitControls, OBJ add-on |
| shadcn minimalist (base-mira) | Side panel, forms, actions without custom CSS sprawl |

## Testing

- Unit: dimension parse, thickness, snap, cut list, board-feet, JSON round-trip, OBJ structure.
- `bun test`, `bun run typecheck`, `bun run build`.
- Browser smoke desktop 1440×900 and mobile 390×844; screenshot + interaction video for PR.

## Deferred

- `.skp` import, Sketch-style inference, WASM parity with official editor, mobile touch sculpt tools.
