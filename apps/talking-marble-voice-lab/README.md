# Talking Marble Voice Lab

Offline browser lab for the real **Talking Marble** npm package (`talking-marble@0.1.0`): side-by-side React `TalkingMarble` and `<talking-marble>` Web Component, shared controls, palettes, mock/offline audio, and accessibility toggles. **Independent demo**, not an official Talking Marble product.

## Goal

Explore the visual orb API without wiring OpenAI Realtime, ElevenLabs, LiveKit, or any network voice SDK. No API keys; no runtime network requests (verified in tests and Playwright smoke).

## Commands

```bash
cd apps/talking-marble-voice-lab
bun install          # bunfig.toml enforces 72h minimumReleaseAge
bun run typecheck
bun test
bun run build
bun run preview      # recommended UI path (production bundle)
bun run dev
bun run smoke        # Playwright desktop + mobile screenshots + demo video
```

## Architecture

- **UI:** Vite 8 + React 19 + TypeScript + shadcn (base-mira) + Tailwind 4.
- **Package:** `talking-marble@0.1.0` — React default export + `talking-marble/element` Web Component.
- **Shared state:** `src/lib/talking-marble-lab.ts` builds identical props for both viewers; `syncPropsToWebComponent` keeps the custom element in sync.
- **Audio:** Level slider (0–1, auto `speaking` when raised from idle/listening), offline Web Audio oscillator mock, optional `getUserMedia` mic after user gesture (never sent off-device).
- **Tests:** Bun tests against real `resolveState` / `resolvePalette`, attribute helpers, prop parity, and no `fetch('http…')` in app source.

## Package source

Installed from npm:

- `talking-marble@0.1.0` (published 2026-11-24T23:34:56Z)

See also upstream [repo](https://github.com/imjustinliao/Talking-Marble), [site](https://talking-marble.vercel.app/), [docs](https://talking-marble.vercel.app/docs/), and [launch post](https://x.com/imjustinliao/status/2125359641312014787).

MIT — see `THIRD_PARTY_LICENSES.md` and `node_modules/talking-marble/LICENSE`.

## Behaviour notes

- **States:** All built-ins plus custom preset state `labGlow` (defined in `LAB_CUSTOM_PRESETS`).
- **Emotions:** All eight built-ins or **none**.
- **Palettes:** Named (`pearl`, `ember`, …) or four custom hex colours (ground + three pigments) via `resolvePalette`.
- **Reactivity:** `listening`, `speaking`, and reactive presets respond to `level` / `audio`; other states ignore audio by design.
- **Halo:** Off (`false`), on (`true`), or strength 0–1.5 via slider.

## Production build

`bun run build` (2026-11-28): main bundle ~350 kB JS (~113 kB gzip) + ~57 kB CSS (~10 kB gzip).

### Dependency ages (exact pins, checked 2026-11-28)

| Package | Version | Published (UTC) |
| --- | --- | --- |
| talking-marble | 0.1.0 | 2026-11-24 |
| react / react-dom | 19.3.1 | 2026-11-26 |
| vite | 8.3.5 | 2026-11-26 |
| typescript | 6.0.3 | 2026-11-27 |
| tailwindcss | 4.3.3 | 2026-11-25 |
| playwright | 1.64.1 | 2026-11-27 |
| shadcn | 4.22.1 | 2026-11-25 |

Lockfile: `bun.lock` with `[install] minimumReleaseAge = 259200`.