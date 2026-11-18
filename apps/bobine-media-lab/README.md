# Bobine Media Lab

Local offline lab using the official **[bobinejs@0.2.2](https://www.npmjs.com/package/bobinejs)** video and audio players (MIT). The previous clean-room reimplementation was replaced with the real npm package pinned to a release at least 72h before the Nov 18 2026 launch window.

## Commands

```bash
cd apps/bobine-media-lab
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

## What changed

- **Players:** `VideoPlayer` and `AudioPlayer` imported from `bobinejs` (not local copies).
- **HLS:** `bobinejs/hls` `hlsLoader` with optional peer `hls.js@1.7.4` (lazy dynamic import).
- **Styles:** `@import "bobinejs/styles.css"` after Tailwind in `src/index.css`.
- **Lab chrome:** shadcn minimalist UI for layout, theme toggle, native-vs-bobine swap, and shortcut help.

## Upstream pins

| Package | Version | Published (UTC) | License |
|---------|---------|-----------------|---------|
| `bobinejs` | 0.2.2 | 2026-11-11T22:33:19.712Z | MIT |
| `hls.js` | 1.7.4 | 2026-10-28T17:30:16.005Z | Apache-2.0 (peer) |
| `react` / `react-dom` | 19.3.1 | 2026-10-14T16:47:15Z | MIT |

Git tag for npm 0.2.2: `7065c1780ef9457c6e6b4fb43ac706c9a0183bc2`. Alternate eligible registry commit noted in tracking: `27f8ba10b519c654ebe2b07af9f77e017e7c8253`.

Launch cutoff (~72h before Nov 18 2026 09:45 IST): **2026-11-15 04:15 UTC**. `bunfig.toml` sets `minimumReleaseAge = 259200`.

## Credits and licenses

- [bobine](https://bobine.fyi) / [github.com/SanyamPunia/bobine](https://github.com/SanyamPunia/bobine) — MIT, see `THIRD_PARTY_LICENSES/bobinejs-LICENSE.txt`.
- [hls.js](https://github.com/video-dev/hls.js) — Apache-2.0, loaded only for `.m3u8` fixtures.
- shadcn/ui lab components — MIT (registry pin `shadcn-ui/ui@8a3536678a528cc012b9e62484290e79d0be410f`).

## Media fixtures

Committed under `public/fixtures/`: test pattern MP4, tone MP3, WebVTT captions, and a short local HLS rendition. Generated offline with system `ffmpeg` (not an app dependency).