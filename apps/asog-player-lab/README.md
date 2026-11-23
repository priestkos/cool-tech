# ASOG Player Lab

Local offline lab for **[Animated SOG](https://github.com/arrival-space/animated-sog)** (MIT, Arrival.Space): a compact `.asog` format for 4D Gaussian splat clips with TRiGS rigid motion and SOG-v2 static attributes.

This app vendors the real JavaScript decoder and `AsogThreePlayer` at commit [`69e2de220813904f8ac9c4b69841b21468ca160c`](https://github.com/arrival-space/animated-sog/tree/69e2de220813904f8ac9c4b69841b21468ca160c). It is an independent demo, not an official Arrival viewer.

## Commands

```bash
cd apps/asog-player-lab
bun install
bun run dev      # http://localhost:5173
bun run test     # decoder + vendor hash checks
bun run typecheck
bun run build
```

Bundled clips live under `public/clips/` (copied from the pin’s `test-data/`). Large `.asog` assets are not part of the gzipped JS bundle.

## Architecture

- **Vite + React** — shadcn minimalist lab chrome only.
- **`vendor/animated-sog/js/src`** — MIT upstream decoder, sort worker, and three.js player.
- **`three@0.187.0`** — matches the official `examples/three` import map at the pin.
- Playback clock, orbit framing, and controls follow `examples/three/viewer.js`.

## Upstream viewers

To run the official examples from the upstream repo, follow [animated-sog](https://github.com/arrival-space/animated-sog) and open [the three.js example](https://arrival-space.github.io/animated-sog/examples/three/).

## Credits

- [arrival-space/animated-sog](https://github.com/arrival-space/animated-sog) · pin `69e2de2` · Copyright (c) 2026 Arrival.Space (MIT) — see `THIRD_PARTY_LICENSES.md` and `vendor/animated-sog/LICENSE`
- [Arrival.Space](https://arrival.space)
- Launch context: [PixelBilly on X](https://x.com/PixelBilly/status/2123790744183816344)
- Sample **Rubloff** flip-book clips from the pin’s `test-data/`
- TRiGS: Yeom, Nam, Choi et al., *Temporal Rigid-Body Motion for Scalable 4D Gaussian Splatting*