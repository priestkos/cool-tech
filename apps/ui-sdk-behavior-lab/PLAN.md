# UI SDK Behavior Lab — PLAN

## Goal

Local offline lab that demonstrates a clean-room recreation of Vercel UI SDK–style interaction *behaviors* (popup, selection, typeahead, dismiss, sortable + live region), with ARIA inspection and a shadcn combobox comparison.

## Single-user MVP

- Behavior picker with live ARIA + focus readout
- Custom combobox built from in-app primitives beside a Base UI / shadcn-styled combobox
- Keyboard-only walkthrough panel
- Multi-select example, sortable list with announcement log
- Agent recipe panel mapping primitives → widgets

## Explicit outs

- No `@ui-sdk/*` install, no copied `vercel-labs/ui` source
- No visual clone of ui-sdk.dev marketing site
- No network at runtime; no API keys
- No real-package swap until ~2026-11-15 10:42 PM IST

## Vertical slices

1. Primitives + unit tests (popup/dismiss/selection/typeahead/aria/live-region/sortable)
2. Popup + single-select + behavior picker + ARIA inspector
3. Combobox pair + keyboard walkthrough + multi-select + sortable + recipe panel

## Stack

- Bun + Vite 8.3.5 + React 19.3.1 — matches proven cool-tech pins
- Tailwind 4.3.3 + shadcn 4.22.1 minimalist — local UI only
- Behaviors implemented in `src/behaviors/` — clean-room APIs, not upstream factory names

## Testing

- `bun test` for primitive state and ARIA helper logic
- `tsc -b`, `vite build`, manual browser smoke (desktop + mobile, keyboard)

## Deferred

- Swap in `@ui-sdk/core@0.1.0-beta.1` after 72h npm eligibility (~Nov 15 10:42 PM IST) with full transitive re-audit
