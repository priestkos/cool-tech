# Kitesurf CDP Lab — PLAN

**Goal:** Offline CDP fixture replay plus optional live WebSocket probe for [Cloudflare Kitesurf](https://kitesurf.dev), with no upstream Kitesurf code in the bundle.

## Mode: clean-room / fixture-only default

Kitesurf open-sourced 2026-11-13; repo is younger than the launch-minus-72h cutoff. This demo uses lab-authored HTML shapes, PNG screenshots, and CDP transcripts only.

## Single-user MVP

1. Pick a fixture URL, replay `Page.navigate` → `DOM.getDocument` → console events → `Page.captureScreenshot`.
2. Show screenshot, DOM tree, and console derived from fixtures.
3. Agent step log with scrubbable request/response JSON and timing.
4. Live mode toggle connects to `ws://127.0.0.1:8787` with visible connection state and graceful failure.
5. Explainer panel on what Kitesurf replaces and its limits.

**Out of scope:** shipping Kitesurf, Workers deploy, puppeteer, multi-user sessions, copying upstream source.

## Stack

- Vite 8 + React 19 + TypeScript — one-screen lab utility.
- shadcn minimalist (`base-mira`) + Base UI — chrome only.
- Hand-written CDP JSON-RPC client + replay engine — no browser automation deps.

## Testing

- Bun tests: framing/id correlation, replay scrub, DOM tree, console mapping, live client failure, step-log JSON round-trip.
- Manual: fixture load, agent scrub, live toggle failure (no server), desktop + mobile viewports.

## Deferred

- Full live CDP command palette once user-run Kitesurf is stable.
- Additional fixture pages beyond intro + agent walk.