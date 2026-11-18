# Bobine Media Lab — plan

## Goal

Offline lab that runs the official **bobinejs@0.2.2** video and audio players on local fixtures, with native-vs-bobine swap, lazy HLS via the package `hlsLoader`, and lab chrome for theme and shortcut help.

## Single-user MVP and outs

**In:** `VideoPlayer` / `AudioPlayer` from npm, swap panel (native `<video>` vs bobine), HLS toggle using `bobinejs/hls`, `?` shortcut cheat sheet aligned with bobine hotkeys, light/dark lab theme, unit tests against `bobinejs` exports (`formatTime`, `createMediaStore`, `describeMediaError`, HLS gate).

**Out:** Clean-room player copies, shadcn registry source install for bobine components, remote streams, API keys, accounts, runtime network beyond local assets and optional peer `hls.js` lazy load.

## Vertical slices

1. Wire bobine players on MP4/MP3 + swap view.
2. Captions (`tracks`), speed/PiP/fullscreen via upstream controls.
3. HLS fixture with instrumented `hlsLoader` telemetry panel.

## Stack

- **Bun + Vite 8.3.5 + React 19.3.1** — cool-tech proven pins; `bunfig.toml` minimum release age.
- **bobinejs@0.2.2** (MIT) — real upstream players and media store.
- **hls.js@1.7.4** — optional peer for bobine HLS adapter (lazy import).
- **Tailwind 4 + shadcn base-mira** — lab shell only (eligible registry pin).

## Testing

- `bun test`: upstream `formatTime`, `describeMediaError`, `createMediaStore` seek/volume, HLS loader gate via lab wrapper.
- Manual: swap, playback, captions, HLS toggle, desktop ~1440×900 and mobile ~390×844; console clean.

## Deferred

- shadcn registry commit `27f8ba10…` comparison vs npm pin (not required when using npm).
- Full visual parity audit vs bobine.fyi marketing site.