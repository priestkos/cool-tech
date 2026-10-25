# Glass Logo Reveal — PLAN

**Goal:** A one-page studio where you drop in a logo, tune the liquid-glass reveal, and copy the settings, built on a React port of glass-icon-reveal's WebGL 2 shader.

Source buzz: https://x.com/zanwei_guo/status/2113506406418780663 (@zanwei_guo, Oct 2026). Source: https://github.com/zanwei/glass-icon-reveal (MIT).

## Single-user MVP
1. `<GlassLogoReveal>` React component: a canvas running the ported WebGL 2 shader and spring timeline. Props: logo source, settings, playing state, background.
2. Logo input: upload an SVG or PNG (also drag-and-drop), or pick one of 3–4 neutral preset marks. Logos go through the ported SDF step.
3. Controls (shadcn sliders): refraction (optical depth), blur/edge smear, highlight (rim light), and timing (spring response and hold), each mapped to the matching upstream uniform.
4. Replay button and play/pause; double-click the stage to replay.
5. Light and dark backgrounds, using the upstream light-glass and dark-glass looks.
6. "Copy settings as JSON" button that copies the current settings and confirms with a toast.
7. WebGL 2 check: if WebGL 2 is missing, show a static fallback (the logo on a CSS-glass tile) with a visible "WebGL 2 unavailable, showing static preview" badge. A renderer badge always shows which path is active.
8. Footer credit and link to glass-icon-reveal (MIT).

**Out of scope:** video/PNG export, text logos, the full upstream control set, keyboard scrubbing, saved presets, backend, deploy.

## Tasks (vertical slices)
1. Read the upstream README and index.html. Scaffold Vite React TS (skip install), add bunfig.toml, install, run shadcn init (minimalist), add the license notice.
2. Port the shader, timeline and SDF into `src/glass/` (renderer, timeline, sdf, settings types). Render one preset end to end.
3. Logo upload and presets, replay and play/pause, light/dark background.
4. Slider controls, copy settings as JSON, WebGL check with static fallback.
5. README, screenshot and video (software WebGL), PR.

## Stack
- Vite + React + TS: least wiring for a static, client-only app.
- Ported glass-icon-reveal WebGL 2 code (no npm package exists): the tech being demoed, with zero runtime dependencies.
- shadcn/ui minimalist preset (slider, button, toggle-group, card, sonner): repo standard.

## Deferred
- Video/PNG export, text logos, the remaining upstream controls, and shareable URL state: not needed for the core demo.
- Tests beyond one each for settings JSON round-trip and slider-to-uniform mapping: critical logic only.
