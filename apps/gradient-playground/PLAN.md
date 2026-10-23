# Gradient Playground — PLAN

**Goal:** A one-page studio to try every free gradients.sh component live and copy its install command.

Source buzz: https://x.com/leodev/status/2112514949167907029 (@leodev, Oct 20 2026). Official: https://gradients.sh.

## Single-user MVP
1. Live hero section whose background is the selected free gradient (mesh, grain, aurora, waves, radial glow, linear flow, section fade).
2. Control panel (shadcn sliders, color pickers): colors, speed, grain/intensity, using each component's documented props.
3. Light/dark theme toggle showing gradients following CSS theme variables.
4. "Copy install command" button for the selected component (`npx shadcn@latest add https://gradients.sh/r/<name>.json`).
5. Gallery: gradient text, gradient button, border, and card on real UI.
6. Renderer badge showing WebGPU vs WebGL2 fallback if detectable.

**Out of scope:** Pro components/presets, saving presets, backend, deploy.

## Tasks (vertical slices)
1. Read gradients.sh docs. Scaffold Vite React TS (skip install), bunfig.toml, install, shadcn init (minimalist), add free registry items.
2. Hero + component switcher.
3. Controls + theme toggle + copy command.
4. Gallery.
5. README, screenshot + video, PR.

## Stack
- Vite + React + TS: least wiring for a static client app.
- gradients.sh free registry components: the tech being demoed.
- shadcn/ui minimalist preset: repo standard.

## Deferred
- Shareable URL state, preset export, deploy preview, tests beyond one for the install-command helper.
