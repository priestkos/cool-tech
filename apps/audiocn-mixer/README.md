# Audio Mixer Board (audiocn)

A one-page mixing desk: test tone, synthesized drum loop, microphone, and local audio file — each with live meters, faders, pan, mute, and solo — summed to a master **LCD meter**, built with [audiocn](https://www.audiocn.dev) on the Web Audio API.

**Buzz:** [X post by @orcdev](https://x.com/orcdev/status/2114276275934355727) · **Source:** [audiocn.dev](https://www.audiocn.dev) · [github.com/audiocn/ui](https://github.com/audiocn/ui) (MIT)

## Run locally

```bash
cd apps/audiocn-mixer
bun install
bun run dev
```

Open the URL Vite prints (default `http://localhost:5173`). Click **Start audio** (browser gesture required), then use the faders and mute/solo toggles.

```bash
bun run build   # production build
bun run test    # drum-loop generator tests
```

## Registry items (fetched 2026-10-26)

Installed with `bunx --bun shadcn@latest add @audiocn/<name>`:

- Components: `mixer`, `channel-strip`, `fader`, `level-meter`, `lcd-display`, `lcd-meter`, `channel-toggle`, `pan-control`, `db-readout`, `clip-indicator`
- Hooks: `use-mixer`, `use-web-audio-mixer`, `use-audio-analyser`, `use-microphone`, `use-audio-context`
- Transitive: `@audiocn/core` (`lib/audio/*`), `db-scale`, `use-audio-config`, `use-clip-hold`, `use-frame-source`, `use-reduced-motion`, `use-visibility`

shadcn/ui (minimalist / Base UI): `button`, `badge`, `card`, `switch`, `slider`, `sonner`

## Audio

All demo sounds are **generated in code** or loaded from **files you choose**. No copyrighted samples from audiocn.dev are bundled.

## License

App code in this folder is part of the cool-tech demos repo. audiocn registry code is MIT — see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
