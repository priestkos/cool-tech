# Hyper Elements Studio — plan

## Goal

Single-user offline studio proving `@hyper-elements/react@0.3.1` end-to-end: one editable card tree in four roots with validation, outline, and local renders.

## MVP in scope

- Editable card (heading, body, button, bundled logo)
- Email / Web / PDF / Image tabs via `render`, `renderPdf`, `renderImage`
- Validation panel (severity, code, path, clients, fix)
- `outline()` inspector
- Vite middleware API (no runtime CDN/fonts)
- Bun tests on critical Hyper Elements behavior

## Explicit outs

- No `@hyper-elements/react` 0.4.x or email-client emulator packages
- No `builder` import, no mail send, no Playwright PDF
- No visual Outlook/Gmail/Apple Mail emulators

## Vertical slices

1. Email + Page HTML + validate (done)
2. PDF + Image with bundled fonts/assets (done)
3. Validation UX + planted error/fix toggles (done)

## Stack

- Bun + Vite 8 + React 19 + shadcn (minimalist base-mira)
- Hyper Elements 0.3.1 + satori + resvg + react-pdf peers
- Server-side writers in Vite `configureServer` middleware

## Testing

- `bun test` — validate, outline, render, PDF magic, PNG/SVG signatures
- Manual — edit card, tabs, validation, outline; desktop + mobile

## Deferred

- `@hyper-elements/email-clients` previews after 72h eligibility
- Bump to Hyper Elements 0.4.x after re-audit
