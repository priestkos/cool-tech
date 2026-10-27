# Sandbox Runtime Playground — PLAN

**Goal:** A one-screen playground for Anthropic's `srt` where you pick which folders and domains an agent may touch, watch the srt settings JSON build live, and run preset agent commands to see what gets allowed or blocked.

Source buzz: https://x.com/RoundtableSpace/status/2114699842601558046 (@RoundtableSpace, Oct 2026). Official: https://github.com/anthropics/sandbox-runtime (npm `@anthropic-ai/sandbox-runtime`, Apache-2.0).

## Single-user MVP
1. Policy panel (shadcn switches, inputs, badges): folder toggles for read and write (e.g. project dir `.`, `/tmp`, `~/.ssh` deny-read on by default, `~/Documents`), and a domain list with add/remove for `allowedDomains` and `deniedDomains` (starts with `github.com` allowed).
2. Live settings JSON: a read-only code panel showing the exact `srt-settings.json` for the current toggles, with a copy button and the matching `srt --settings srt-settings.json <cmd>` line.
3. Preset agent commands: "Read ~/.ssh" (checks access only, never prints contents), "curl an allowed domain" (e.g. https://github.com), "curl a blocked domain" (e.g. https://example.com), plus "Write to /tmp" and "Write outside allowed folders". One click runs one; "Run all" runs them in order.
4. Run log: each run shows the command, ALLOWED (green) or BLOCKED (red), the reason (srt's violation text in real mode, the matching rule in mock mode), duration, and a "real" or "simulated" badge.
5. Mode switch: mock mode on by default; real mode enabled only when the server reports srt is usable on this machine (status card explains what is missing, e.g. bubblewrap on Linux).

**Out of scope:** free-form commands, MCP server wrapping, credential masking, `--control-fd` live updates, Windows support, auth, deploy.

## Tasks (vertical slices)
1. Read the srt 0.0.81 README and types. Check that every pinned package is at least 3 days old. Scaffold Vite React TS (skip install), bunfig.toml, install pinned versions, shadcn init (minimalist).
2. Settings builder (pure function from toggles to srt settings JSON) and the live JSON panel.
3. Mock policy engine applying srt's precedence rules, the presets, and the run log (mock mode end to end).
4. Bun.serve server: /api/status (dependency check + smoke test) and /api/run (writes temp settings, runs the fixed preset through srt, returns allowed/blocked plus violations, redacts output). Vite proxy; one `bun run dev` for both. Real-mode toggle.
5. README (run steps, real-mode setup per OS, pinned versions with dates), tests for the settings builder and mock policy, screenshot and video, PR.

## Stack
- `@anthropic-ai/sandbox-runtime` 0.0.81: the tech being demoed, pinned to a version past the 3-day rule.
- Bun.serve: srt must run on the host, and this is the smallest server with no extra framework.
- Vite + React + TS with a dev proxy: least wiring for a one-screen client.
- Mock policy engine: the demo works on any machine, including ones without bubblewrap or sandbox-exec.
- shadcn/ui minimalist preset (switch, input, button, card, badge, tabs, scroll-area): repo standard.

## Deferred
- Free-form command box: unsafe to expose from a browser; presets show the idea.
- `ask` callback (approve unknown domains live) and per-command network lists: nice next step once the basics land.
- Credential masking and `tlsTerminate`: needs certificate setup, too much for the MVP.
- Deploy preview: real mode needs a host runtime, so it comes later.
