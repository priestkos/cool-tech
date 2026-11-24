# Koipond Lab — PLAN

**Goal:** Offline lab chrome around the published `@hxlfed/koipond@0.1.0` `<KoiPond />` — full-viewport pond, every `LOOKS` key, documented props, imperative feed/ripple/current, and a live hero embed.

## Single-user MVP

1. Full-screen interactive pond (`100vh`) using the real npm component + `three@0.187.0`.
2. Look picker for all seven `LOOKS` keys (`natural`, `ink`, `garden`, `lagoon`, `violet`, `ember`, `mono`).
3. Props panel wired to documented defaults (including optional `water` override).
4. Feed / ripple / current via `KoiPondHandle` + upstream double-tap/long-press on the pond.
5. Hero marketing-band preview with a second live `KoiPond`.
6. About sheet + `THIRD_PARTY_LICENSES` (MIT koipond, three.js, nagomi inspiration note).

**Out of scope:** Custom `Look` objects, npm wallpaper apps, shadcn registry copy from `main`, custom water shaders.

## Stack

- Bun + Vite 8 + React 19 + shadcn (base-mira) — cool-tech eligible pins.
- `@hxlfed/koipond@0.1.0` from npm (gitHead `a1479c597ac3ca551dfa5231dc58729c632c4d0d`).

## Testing

- `bun test` for `LOOKS` coverage and prop mapping.
- `bun run typecheck` / `bun run build` (gzip bundle in build output).
- Manual smoke: pond swim, look change, feed, props, hero embed, console/network.

## Deferred

- Water colour pickers (text hex only), mobile-first panel drawer, extra formation handle UI.