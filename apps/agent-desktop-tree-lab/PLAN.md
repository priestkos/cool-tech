# Agent Desktop Tree Lab — PLAN

**Goal:** A one-page lab that shows how an agent reads and operates a desktop app through its accessibility tree: a fake app window beside its live tree, an agent-desktop-style console replaying snapshot, click and type steps against refs, and an honest token meter comparing tree reads with screenshot reads, all in a clearly labelled mock mode with no real OS control.

Source buzz: https://x.com/ctatedev/status/2116323148706771302 (@ctatedev, Oct 31 2026). Inspired by https://github.com/vercel-labs/agent-desktop (Apache-2.0, Vercel Labs), docs read at commit 3c3c8a9 (v1.0.1). Unofficial demo, not made by or affiliated with Vercel.

## Single-user MVP
1. Fake app window: one original Notes-style app ("Jotter") with folders, a note list, title and body fields, a search field, New / Delete / Share buttons and a "Pin note" checkbox. No real product names or logos.
2. Live accessibility tree: built from the app's state with agent-desktop-style roles, names, states and actions; `snapshot` gives qualified refs `@<snapshot_id>:e<N>` to addressable elements only; `-i` and `--compact` filters; a JSON envelope viewer; tree ↔ window highlight.
3. Command console: agent-desktop CLI lines (`snapshot`, `click`, `type`, `set-value`, `get`, `find`) run against the simulator, with real-shaped envelopes and errors (`STALE_REF`, `INVALID_ARGS`); a scripted scenario with play / pause / step / reset; free-typed commands.
4. Token meter: per-step and total estimated tokens for the tree read vs a screenshot of the window, computed from the actual JSON bytes and pixel size with a documented method; labelled as estimates, not measurements.
5. Two simulated agent cursors: a multi-agent scenario (`--agent-id writer` and `tidier`) with labelled cursors and interleaved console steps, each using its own snapshot's refs.
6. Header: links, a "Mock mode: scripted replay, no real OS control" badge and the unofficial disclaimer.

**Out of scope:** installing or running agent-desktop, any real OS or browser automation, AI or LLM agents, screenshots of the real screen, a local bridge or server, more than one fake app, the other ~50 commands, persistence, auth, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for the reference commit and every pinned package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Fake app model and window, and the tree builder with `snapshot` (refs, `-i`, `--compact`, deterministic ids), shown as an outline and JSON envelope.
3. Command parser and dispatcher (`click`, `type`, `set-value`, `get`, `find`) with real-shaped envelopes and errors; tree ↔ window highlight.
4. Scripted scenario with play / pause / step / reset and the free-typed console; the mock badge and disclaimer.
5. Token meter with the documented estimator and "How we estimate" popover; the two-cursor multi-agent scenario.
6. Tests (tree and snapshot, parser and errors, token estimator), README (pins with dates, reference commit, mock-mode notes, estimate method, license table), screenshot and video, PR.

## Stack
- Own TypeScript simulator (app model → tree → snapshot → command dispatcher): the honest stand-in for the CLI, deterministic and testable, with no OS access.
- agent-desktop's documented envelope, ref syntax and command names: keeps the console accurate to the real tool.
- Own token estimator (bytes/4 for text, w×h/750 for images, both cited): transparent numbers without a tokenizer dependency.
- Vite + React + TS: least wiring for a client-only page.
- shadcn/ui minimalist preset (card, button, badge, tabs, scroll-area, popover, input, tooltip): repo standard for the lab panels.

## Deferred
- Real mode through a local bridge to the agent-desktop CLI: needs a native install, OS accessibility permissions and a server; agent-desktop 1.0.2 is also under 3 days old until Nov 3 02:48 IST.
- A real tokenizer for exact counts: adds a dependency and is model-specific; the documented estimate is enough to show the gap.
- `--skeleton` / `--root` drilling and a second fake app (Finder-style file browser): good follow-ups once one app is clear.
- Trace export viewer (`trace export`): nice, but not needed to show the observe → act → verify loop.
- Deploy preview: optional per AGENTS.md; do it later on the shared Pages project.
