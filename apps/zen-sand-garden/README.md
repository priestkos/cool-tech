# Zen Sand Garden

Offline settings lab for the four real [Zen Sand UI](https://github.com/finktheartist/zen-sand-ui) custom elements (MIT, Justin Finkelman / [@crtvTeknologist](https://x.com/crtvTeknologist)). Sand is a per-pixel height field lit with WebGL2 — not a CSS fake or a clean-room engine.

## Commands

```bash
cd apps/zen-sand-garden
bun install
bun run dev
```

| Script | Purpose |
|--------|---------|
| `bun run dev` | Vite dev server |
| `bun run build` | Production build (`dist/`) |
| `bun run typecheck` | `tsc -b` |
| `bun test` | Agent sequence unit tests |
| `bun run preview` | Serve production build |

## How the controls arrive

At commit [`8e9b289523e6fdcb19e8be9db5b7ea6a9ccc6c7b`](https://github.com/finktheartist/zen-sand-ui/tree/8e9b289523e6fdcb19e8be9db5b7ea6a9ccc6c7b), copy byte-identical files into `public/zen-sand-ui/`:

- `slider.js`, `toggle.js`, `signature.js`, `thinking.js`
- `LICENSE` → `THIRD_PARTY_LICENSES` (app root) and `public/zen-sand-ui/LICENSE`

**Do not** use `npx shadcn add finktheartist/zen-sand-ui/...` (unpinned registry). **Do not** rewrite, split, or ES-module-wrap the scripts.

`index.html` loads them with classic `<script src="...">` tags (order: slider → toggle → signature → thinking). React talks to the elements via DOM properties and events only.

## What ships

1. All four controls on a **light** page with shadcn settings chrome.
2. Slider value readout, signature undo/clear/export PNG (`toDataURL('#1f2a44', 2)`), thinking manual states + Run/Stop fake agent (~3.5s per state).
3. Tray width preset (sand resolution) and `ZenSand.Sound.on` mute — no invented speed slider on this pin.
4. WebGL2 honest fallback banner; About panel with upstream links and limits.

## Credits & upstream limits

- Live gallery: https://zen-sand-ui.vercel.app
- Launch post: https://x.com/crtvTeknologist/status/2123815420016681109
- Sounds: ElevenLabs (upstream). Thinking rock: GPT Image via Higgsfield (upstream).
- Independent cool-tech demo, not official.
- WebGL2 required to draw; ~16 browser WebGL canvases max; sand does not respect `prefers-reduced-motion`; state changes ~2s including sweep.

## Bundle size

Production JS shell (Vite) is ~88 KB gzip (`bun run build` report). The four vendored control scripts total ~895 KB on disk (sounds and rock inlined as data URIs) and are served as static files from `public/`, not bundled into the app JS.

Evidence: `dependency-evidence.json`.