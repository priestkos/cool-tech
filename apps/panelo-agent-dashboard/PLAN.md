# Panelo Agent Dashboard — PLAN

## Goal

Offline lab wrapping the real pinned Panelo Home Care Schedule, free charts, fixture workflows, and the official `createAgent` / `useAgentChat().play()` bridge so scripted agent steps and clicks share the same UI SDK controls.

## Single-user MVP

- Vendored `dashboard-pages/thirteen` + Sales Trend + Trends charts at git `6517e2e7062f97501e46e73ba1e545f19ef556e2`.
- Workflow table (fixture) with pause/delete via Panelo `Switch` / `Button`.
- Mock agent suggestion buttons using `play()` only (no `/api/agent`).
- Permissions switch “Delete without asking” wired to `data-agent-confirm` + `pendingConfirm`.
- Action log from `useAgentChat` entries.
- About/credits, README, age evidence, bun tests, typecheck, build.

## Explicit outs

- No live `@panelo` / shadcn registry, no paneloui `main`, Pro blocks, model API, Google Fonts, or JS under `public/`.
- No port of full Next.js site shell.

## Vertical slices

1. Scaffold + pins + vendor copy + styles (system fonts, ui-sdk web.css).
2. Agent hooks on schedule filters (search, area, day/week) and workflow CRUD.
3. Lab chrome: charts row, agent panel, confirm UI.
4. Tests, agecheck, build, smoke evidence.

## Stack

Bun + Vite 8 + React 19 + Tailwind 4 + `@ui-sdk/*@0.1.0-beta.2` + vendored Panelo MIT source.

## Testing

- `bun test`: agent `play` steps for filter, pause, blocked/approved delete.
- `tsc -b`, `vite build`, preview zero-network check.
- Desktop GUI smoke with recording.

## Deferred

- Extra free charts, mobile drawer polish, deploy preview.