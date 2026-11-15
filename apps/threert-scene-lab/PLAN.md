# ThreeRT Scene Lab — plan

## Goal

Offline lab that independently explores a ThreeRT-style scene workflow: physical sun lux, emissive and artificial lights, a lab-owned JSON scene schema, and live three.js preview (browser raster path only).

## Single-user MVP

- Local editor with JSON + sun/exposure controls, physical-unit readouts, five original sample scenes, comparison/credit panel with external links only.
- No API keys, accounts, or runtime network fetches.

**Out of scope:** `@threert/*` packages, copied ThreeRT scenes/images, faked path tracing, native macOS/iOS clients.

## Vertical slices

1. **Schema + preview** — Validate lab scene JSON; sun azimuth/elevation/lux; three.js canvas with OrbitControls.
2. **Physical panel + gallery** — Lux/lm/cd/emissive readouts; sample scenes (courtyard, night street, interior, studio, overcast).
3. **Compare + credit** — Honest browser vs native explainer; links to threert.dev / GitHub / launch post.

## Stack

| Piece | Why |
|-------|-----|
| Bun + Vite 8.3.5 | Monorepo demo convention |
| React 19 + TS 6 | Proven pins from sibling apps |
| three@0.187.0 | Physically meaningful lights + preview |
| shadcn base-mira | Tabs, cards, sliders for lab chrome |

## Testing

- `bun test`: schema validation, parse errors, physical conversions, sun direction, all samples validate, JSON round-trip.
- `bun run typecheck`, `bun run build` + bundle size.
- Browser smoke desktop/mobile; screenshot + interaction video for PR.

## Deferred

- Swap to real `@threert/scene` after ~2026-11-16 06:05 IST eligibility.
- Area lights, glTF import, collaborative editing, Cloudflare deploy preview.