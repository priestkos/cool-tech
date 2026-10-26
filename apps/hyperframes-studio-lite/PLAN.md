# HyperFrames Studio Lite — PLAN

**Goal:** A one-page studio where you pick or write a HyperFrames HTML composition, scrub it live in the browser, and render it to a real MP4 with one click.

Source buzz: https://x.com/GitRanks/status/2113295563768602750 (@GitRanks, Oct 2026). Source: https://github.com/heygen-com/hyperframes (Apache-2.0).

## Single-user MVP
1. Template picker with three starter compositions written for this demo, each 1280x720, 5–6 s, GSAP timeline registered on `window.__timelines`: Title card (title and subtitle fade and slide in), Kinetic-type quote (words pop in one by one), Product launch (a neutral product name, three feature lines, and a closing call to action).
2. HTML composition editor: a monospace textarea (or a lightweight code editor that passes the 3-day rule) holding the full composition. Edits update the preview after a short debounce. "Reset to template" button.
3. Live preview: `<hyperframes-player>` from `@hyperframes/player` with `srcdoc`, scaled to fit, plus a shadcn timeline slider showing current time and duration that scrubs frame by frame (seek on drag), play/pause, and a frame/time readout at the composition's fps.
4. Render status card from GET /api/capabilities: FFmpeg found or not, Chrome found or not (and the HyperFrames version). Missing tools show a clear notice ("Render unavailable: FFmpeg not found. Install it, or run `bunx hyperframes browser ensure` for Chrome.") while preview keeps working.
5. "Render MP4" button: POST /api/render, poll status with a progress/log line, then play the MP4 in a `<video>` and offer a download link. Errors show the CLI's message.
6. Footer credit and links to HyperFrames (Apache-2.0) and GSAP's license.

**Out of scope:** the HeyGen cloud, auth, publish, the catalog/`hyperframes add`, audio and video clips, multiple compositions per project, saving projects, deploy.

## Tasks (vertical slices)
1. Read the HyperFrames README, quickstart and the 0.8.186 CLI and player packages. Check every pin is at least 3 days old. Scaffold Vite React TS (skip install), bunfig.toml, install pinned versions with overrides, shadcn init (minimalist).
2. Templates and editor feeding a live `<hyperframes-player>` preview, with the timeline slider, play/pause and time readout.
3. Bun.serve server with /api/capabilities, the Vite proxy, and one `bun run dev` for both. Status card and the missing-tools notice.
4. /api/render: temp dir, local GSAP copy, spawn `hyperframes render` under Bun, status polling, MP4 playback and download.
5. README, screenshot and video (preview mode; plus a real render if the VM can), PR.

## Stack
- `hyperframes` 0.8.186 CLI: the tech being demoed; the server spawns its `render` command, pinned past the 3-day rule.
- `@hyperframes/player` 0.8.186: the official web component for previewing and seeking a composition.
- `gsap` 3.15.0, served locally: the seekable animation the templates use, so preview and render work offline.
- Bun.serve: rendering needs a server process; this is the smallest one with no extra framework.
- Vite + React + TS with a dev proxy: least wiring for a one-screen client.
- shadcn/ui minimalist preset (button, card, tabs, slider, badge, alert, scroll-area, sonner): repo standard.

## Deferred
- Lint/check button (`hyperframes lint`), fps/resolution/quality pickers, GIF output: nice to have.
- Syntax-highlighted editor and template thumbnails: polish.
- Tests beyond the composition-validation helper (has a composition id, duration and registered timeline) and the capabilities parser: critical logic only.
