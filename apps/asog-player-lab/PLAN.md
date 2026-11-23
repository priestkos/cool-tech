# ASOG Player Lab — PLAN

**Goal:** Local offline lab that plays the two bundled Rubloff `.asog` clips through the real vendored `AsogThreePlayer` from arrival-space/animated-sog at pin `69e2de2`.

## Mode: real upstream code

Vendored MIT tree at `vendor/animated-sog/` (commit `69e2de220813904f8ac9c4b69841b21468ca160c`, committer 2026-11-20T11:55:02Z). No clean-room decoder, no Spark stand-in.

## Single-user MVP

1. WebGL 2 three.js viewport with orbit controls framing `player.bounds` after load.
2. Clip picker: `rubloff-1s` / `rubloff-6s` from `/public/clips`.
3. Play / pause / scrub on shared `getTime` clock (official viewer pattern).
4. Load progress via real `onProgress`; stats from `player.numSplats`, `player.stats`, fps.
5. Sound toggle hidden/disabled when `hasAudio` is false (both bundled clips).
6. About panel + THIRD_PARTY_LICENSES with MIT Arrival.Space notice.

**Out of scope:** PlayCanvas viewer, Python encoder, Docker trainer, network clips, 4k rubloff with audio, WebGPU.

## Stack

- Vite 8 + React 19 + TypeScript — cool-tech eligible pins.
- shadcn minimalist (`base-mira`) — lab chrome only.
- `three@0.187.0` — matches official example import map at pin.
- Vendored `animated-sog` js/src — real decoder and player.

## Testing

- Bun: `openAsog` / `decodeAsog` on both clips; assert `manifest.count` and byte sizes; vendor SHA256 manifest; clock scrub unit test.
- Browser: play, orbit, switch clips, stats populated.

## Deferred

- Compare viewer, live URL streaming UX polish, mobile autoplay quirks.