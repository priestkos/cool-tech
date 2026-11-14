# Bobine Media Lab — plan

## Goal

Offline lab demonstrating independent clean-room video and audio players with native-element prop parity, custom controls, keyboard shortcuts, captions, PiP, speed, lazy HLS, and light/dark theme tokens.

## Single-user MVP and outs

**In:** swap view (native vs clean-room), shared controls, shortcut overlay (`?`), local fixtures (MP4/MP3/VTT/HLS), lazy `hls.js` load panel, theme toggle, unit tests for shortcuts/props/HLS gate.

**Out:** bobine registry install or copied source, remote streams, API keys, accounts, runtime network beyond local assets.

## Vertical slices

1. Video swap + play/pause/seek/volume + keyboard overlay.
2. Captions, speed menu, PiP (graceful fallback), theme tokens.
3. Audio player + HLS lazy-load proof panel.

## Stack

- **Bun + Vite 8.3.5 + React 19.3.1** — matches proven cool-tech pins, fast local dev.
- **Tailwind 4 + shadcn base-mira** — minimalist lab chrome from eligible registry pin.
- **hls.js 1.7.4** — dynamic import only for `.m3u8` sources.

## Testing

- `bun test`: shortcuts, prop passthrough, speed/caption state, theme class, HLS import gate (mocked).
- Manual: swap view, overlay, captions/speed/PiP/theme, audio, HLS panel; desktop + mobile.

## Deferred

- Post–Nov 15 2026 IST registry comparison if bobine publishes a license.
- Mobile-native PiP where unsupported; advanced accessibility audit beyond focus labels.