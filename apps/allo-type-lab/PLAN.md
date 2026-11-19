# Allo Type Lab — PLAN

## Goal

Local offline type lab for the real Allo variable font (`allo-font@1.0.0`) with axis sliders, OpenType toggles, contextual tests, and UI presets.

## Single-user MVP

**In:** Axis playground (wght, ROND, opsz + auto), drag pad, feature before/after toggles, contextual `calt` box, personality presets + copy CSS, credits/OFL, Bun tests, screenshot + video.

**Out:** Account system, CDN font loading, newer allo-font versions, custom lookalike fonts, deploy pipeline.

## Vertical slices

1. Scaffold + pinned deps + `allo-font` local bundle
2. Axis + feature CSS builders and tests
3. UI sections (shadcn chrome) wired to builders
4. Evidence, tracking, README, browser smoke

## Stack

- **Vite 8.3.5 + React 19.3.1 + TS 6.0.3** — matches proven cool-tech demos; fast local dev.
- **Tailwind 4.3.3 + shadcn base-mira** — minimalist lab chrome without custom design system.
- **allo-font@1.0.0** — real OFL font files, no runtime network.

## Testing

- `bun test` for variation/feature strings, presets, clamping, copy CSS, font + license files.
- `bun run typecheck && bun run build` for production bundle size.
- Manual browser: sliders, pad, toggles, contextual textarea, presets, copy buttons; desktop + mobile.

## Deferred

- Oblique preview panel, per-glyph inspector, URL state sharing, Cloudflare Pages deploy.