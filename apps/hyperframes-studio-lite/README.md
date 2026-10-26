# HyperFrames Studio Lite

One-page studio demo for [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache-2.0): pick or edit an HTML composition, scrub it with the official `<hyperframes-player>` web component, and render a deterministic MP4 via the local CLI.

Buzz: [@GitRanks on X](https://x.com/GitRanks/status/2113295563768602750).

## Run

```bash
cd apps/hyperframes-studio-lite
bun install
bun run dev
```

Open the Vite URL (default `http://localhost:5173`). Preview mode works with **no API keys** and does **not** require FFmpeg or Chrome.

`bun run dev` starts both:

- Vite (UI) with a proxy for `/api` and `/vendor`
- Bun.serve API (`server/index.ts`) for capabilities, GSAP vendor route, and render jobs

## Render requirements

Local MP4 export spawns:

```bash
bun node_modules/hyperframes/bin/hyperframes.mjs render <tmpdir> -o out.mp4 --quality draft --workers 1 --quiet
```

You need:

- **Bun** (or Node 22+) to run the CLI under Bun
- **FFmpeg** on `PATH`
- **Chrome** (system install) or run `bunx hyperframes browser ensure` — the app never auto-downloads Chrome; it shows the command in the UI instead.

Telemetry is disabled in spawned renders (`HYPERFRAMES_NO_TELEMETRY=1`, `DO_NOT_TRACK=1`).

## Preview implementation

Live preview uses `<hyperframes-player srcdoc="...">` from `@hyperframes/player@0.8.186`. Composition HTML references `./gsap.min.js`; the preview rewrites that to `/vendor/gsap.min.js` (served from `node_modules/gsap`). Renders copy `gsap.min.js` next to `index.html` in a temp directory under the OS temp folder.

## GSAP license

Templates animate with [GSAP 3.15.0](https://gsap.com/standard-license) under the **Standard "no-charge"** license (not MIT). GSAP is vendored locally for offline preview and render.

## Pinned versions

- `hyperframes@0.8.186`
- `@hyperframes/player@0.8.186`
- `gsap@3.15.0`

## Tests

```bash
bun test
```

Covers composition validation helpers and capabilities parsing.
