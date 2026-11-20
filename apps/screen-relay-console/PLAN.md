# screen-relay Console — plan

## Goal

One-sentence: a local Bun/Vite lab that attaches to **real** `screen-relay@0.1.0` via the Node SDK (or honest mock frames) with viewer, exclusive control, agent loop, and doctor readout on loopback only.

## Single-user MVP

**In:** SDK connect/attach, mock fallback, viewer view-only vs take-control with one controller, agent loop with PNG thumbnails, status/capabilities/doctor panel, shadcn chrome, bun tests.

**Out:** Running `screen-relay install` / shipping engine binaries, public bind, multi-user auth, cloud deploy, real H.264 in mock mode.

## Vertical slices

1. Vite middleware API + `SessionManager` wrapping `createClient` / mock client.
2. Control panel + exclusive control lease (panel vs viewer).
3. Viewer (iframe live / PNG mock) + agent loop UI with log.
4. Doctor + status panels, README/licenses, tracking record.

## Stack

- **Bun** — install, test, dev orchestration; **Node ≥22** — `screen-relay` SDK at runtime in Vite server middleware.
- **Vite 8 + React 19** — UI; middleware hosts lab API (no separate server process).
- **shadcn minimalist** — cards, buttons, switch (pins from sibling cool-tech apps).

## Testing

- `bun test` — mock PNG, mock SDK agent loop, control gating, session manager.
- Manual — desktop 1440×900 + mobile 390×844, keyboard focus, mock mode (no external requests).

## Deferred

- Attempt `screen-relay up` in CI; embed bundled viewer assets when engine absent; Wayland/X11 install docs in UI wizard.