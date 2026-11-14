# Bobine Media Lab

Local offline lab with **independent clean-room** video and audio players inspired by [bobine](https://bobine.fyi) by Sanyam Punia. This is **not** the official bobine player — no registry JSON or upstream source was installed or copied. At scout time (Nov 2026) bobine had no visible public license and was younger than the repository’s 72h eligibility window.

## Commands

```bash
cd apps/bobine-media-lab
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

## Architecture

- `src/features/player/` — `VideoPlayer` and `AudioPlayer` with native-element prop passthrough, keyboard shortcuts, captions, speed, PiP, fullscreen, and theme tokens via CSS variables.
- `src/features/player/hls-loader.ts` — dynamic `import("hls.js")` only when an `.m3u8` source is selected.
- `public/fixtures/` — ffmpeg-generated MP4, MP3, WebVTT, and local HLS segments (no remote media).

Production build (Nov 14 2026): main client chunk ~90.45 kB gzip; `hls.js` in a separate lazy chunk (~180 kB gzip).

## Credits

- [bobine.fyi](https://bobine.fyi) — inspiration and public feature description.
- [Launch post](https://x.com/sanyampunia/status/2120796070540365928) — Sanyam Punia.
- [hls.js](https://github.com/video-dev/hls.js) — Apache-2.0, lazy-loaded.
- shadcn/ui components — MIT (eligible registry pin `shadcn-ui/ui@8a3536678a528cc012b9e62484290e79d0be410f`).

## Media fixtures

Fixtures were generated with system `ffmpeg` (not an app dependency): ~10s test pattern video, tone audio, and a short HLS rendition committed under `public/fixtures/`.