# Papercraft Studio — plan

## Goal

Wrap the vendored xikhar/papercraft countryside templates in a local Bun + Vite React studio with palette, fold scrubber, tilt-shift, sound, 2D/3D mode, and PNG export—without reimplementing paperkit, harness, or sound.

## Single-user MVP

**In:** Vendored pin `57c4c93`, iframe + `window.__papercraft`, eleven palettes, studio chrome (shadcn minimalist), offline runtime, MIT credits.

**Out:** New worlds, Python critique scripts, skills CLI, CDN three, npm `papercraft` package, network at runtime.

## Vertical slices

1. Vendor assets + SHA check + allowed harness `sound` / `setOpen` hook.
2. Studio HTML + import maps + local `three@0.187.0`.
3. Studio scenes remount countryside with palette roles.
4. React chrome: mode, scrubber, toggles, export.
5. README, evidence, tracking, PR media.

## Stack

- Bun + Vite 8 + React 19 + shadcn/base-ui + Tailwind 4 — matches cool-tech demo conventions.
- three@0.187.0 — official template pin.
- Iframe isolation — keeps harness loop untouched.

## Testing

- `bun test` for URL helpers.
- `bun run typecheck` + `build`.
- Manual browser: fold, scrub, palette, tilt, sound, 2D, PNG.

## Deferred

- Palette live remap without iframe reload for structural colours only (reload is acceptable for MVP).
- Mobile-specific layout polish beyond responsive grid.