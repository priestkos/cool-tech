# Security Audit Explorer — PLAN

## Goal

Offline single-user explorer for security-audit-skill run artifacts (findings, coverage ledger, REPORT.md) with live vendored schema validation, browsable verdict tabs, heatmap, report preview, and run diff.

## Single-user MVP

**In:** vendored Cloudflare schema+validators, two example fixture runs, file drop, validation panel, findings tabs, coverage heatmap, REPORT preview, alpha/beta diff, bun tests/typecheck/build.

**Out:** live audits, agent orchestration, API keys, network fetches, installing the full skill package.

## Vertical slices

1. Vendor pinned upstream files; load Example Alpha with inline validation + verdict tabs.
2. Coverage heatmap, REPORT preview, Example Beta + fingerprint-based diff.
3. File drop, keyboard-friendly tabs, responsive layout, EXAMPLE DATA banners.

## Stack

- **Bun + Vite 8 + React 19 + TypeScript 6** — matches monorepo demo conventions; fast local tooling.
- **shadcn base-mira / @base-ui** — consistent UI with sibling apps; components copied from pinned registry revision.
- **Vendored `.cjs` validators** — same error paths as upstream in browser adapter + bun tests.

## Testing

`bun test` for validation, fixtures, filtering, heatmap statuses, diff, parse errors; `tsc -b` + `vite build`; browser smoke desktop/mobile via screen recording.

## Deferred

- Deploy to Cloudflare Pages path
- Importing full upstream hunt markdown corpora
- ajv or alternate schema engines
