# ThreeRT Scene Lab — plan

## Goal

Offline lab that edits lab JSON, builds scenes with **`@threert/scene@0.1.1`**, shows physical-unit readouts from the upstream API, and previews via real **three.js** rasterization in the browser.

## Single-user MVP

- JSON editor + sun/preview sliders, physical readouts (`lightDesc`), five sample scenes, compare/credit panel, three.js canvas mirroring the ThreeRT scene graph.
- No API keys, accounts, or runtime network fetches.

**Out of scope:** Native path tracing in Vite, `@threert/gameplay`, glTF import, Cloudflare deploy.

## Vertical slices

1. **Document + build** — Lab JSON v2 → `buildThreertScene()` with `DirectionalLight` lux, `SkyAtmosphere`, meshes, cd lights.
2. **Binding tests** — `RecordingEngine` + `SceneBinding.sync()` prove upstream engine contract.
3. **Preview bridge** — Mirror `@threert/scene` graph into three.js WebGL for the canvas.
4. **Compare + credit** — Honest browser vs native explainer; npm/GitHub links.

## Stack

| Piece | Why |
|-------|-----|
| Bun + Vite 8.3.5 | Monorepo demo convention |
| React 19 + TS 6 | Proven pins from sibling apps |
| `@threert/scene@0.1.1` | Official ThreeRT scene API (pinned ≥72h) |
| three@0.187.0 | Browser raster preview only |
| shadcn base-mira | Tabs, cards, sliders for lab chrome |

## Testing

- `bun test`: document validation, `SceneBinding` sync, lux/cd via `lightDesc`.
- `bun run typecheck`, `bun run build` (gzip bundle ~278 kB JS at Nov 2026 rebuild).
- Browser smoke desktop/mobile; screenshot + video for PR.

## Deferred

- `@threert/gameplay` input loop, glTF samples from upstream repo, area lights in JSON editor, deploy preview.