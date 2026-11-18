# UI SDK Behavior Lab — PLAN

## Goal

Local offline lab that exercises **real** Vercel UI SDK packages (`@ui-sdk/core`, `@ui-sdk/react`, `@ui-sdk/web` at `0.1.0-beta.2`) for popup, selection, typeahead, dismiss, sortable, and live-region behavior, with ARIA inspection and a Base UI combobox comparison.

## Single-user MVP

- Behavior picker with live ARIA + focus readout
- Official `@ui-sdk/react` combobox beside a Base UI / shadcn-styled combobox
- Keyboard-only walkthrough panel
- Multi-select example, sortable list with announcement log
- Agent recipe panel mapping upstream primitives → widgets

## Explicit outs

- No clean-room reimplementation of upstream behavior primitives
- No visual clone of ui-sdk.dev marketing site
- No network at runtime; no API keys
- No upgrade past eligible npm pin (`0.1.0-beta.2`) until re-audited

## Vertical slices

1. Pin `@ui-sdk/*@0.1.0-beta.2` + unit tests against `@ui-sdk/core` foundation APIs
2. Popup + single/multi select demos via `@ui-sdk/react` + behavior picker + ARIA inspector
3. Combobox pair + keyboard walkthrough + sortable (`movedTo` / `reorderMessage`) + recipe panel

## Stack

- Bun + Vite 8.3.5 + React 19.3.1 — proven cool-tech pins
- Tailwind 4.3.3 + shadcn 4.22.1 — lab chrome only
- `@ui-sdk/core` / `@ui-sdk/react` / `@ui-sdk/web` `0.1.0-beta.2` — Apache-2.0 upstream behaviors

## Testing

- `bun test` for `@ui-sdk/core` primitives (typeahead, popup attrs, reorder, dismiss reasons)
- `tsc -b`, `vite build`, manual browser smoke (desktop + mobile, keyboard)

## Deferred

- Bump `@ui-sdk/*` after a new 72h-eligible release and full transitive re-audit