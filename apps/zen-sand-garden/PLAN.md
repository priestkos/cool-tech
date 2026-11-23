# Zen Sand Garden — PLAN

**Goal:** Offline shadcn settings lab that wires all four real Zen Sand UI custom elements (vendored MIT scripts at pin `8e9b289`) with tray-size and sound controls plus a scripted fake agent run on `<sand-thinking>`.

## Single-user MVP

1. Light-page settings panel with `<sand-slider>`, `<sand-toggle>`, `<sand-signature>`, and `<sand-thinking>` loaded via classic script tags (byte-identical vendored files).
2. Slider value readout, signature undo/clear/export PNG, optional manual thinking states, Run/Stop agent sequence (≥3.5s per state).
3. Tray width preset (sand resolution) and `ZenSand.Sound.on` toggle; no fake speed slider.
4. WebGL2 honest fallback; About/credits panel with upstream links and limits.
5. Bun tests for agent script timing constants; typecheck, build, smoke screenshot + video.

**Out of scope:** clean-room sand, npm zen-sand-ui package, patched core.js, upstream gallery app, dark theme tray chrome, speed/time-scale hacks.

## Stack

- Bun + Vite 8 + React 19 + TypeScript — eligible pins matching `ding-toast-lab`.
- shadcn minimalist (`base-mira`) — lab chrome only.
- Vendored `public/zen-sand-ui/*.js` — real controls, no runtime network.

## Testing

- `bun test` — agent sequence helper and step labels.
- `bun run typecheck` / `bun run build` — production bundle.
- Browser ~1440×900: rake slider, toggle stone, sign + export, run agent; zero external requests.

## Deferred

- Mobile-specific layout polish beyond responsive CSS.
- Cloudflare Pages deploy path.