# Astryx Agent UI Lab — PLAN

## Goal (one sentence)

Let one user compare the same settings and dashboard prompt fixtures rendered side-by-side by real **@astryxdesign/core@0.7.8** versus **shadcn/ui**, with shared theme/preferences, fixture tabs, and an honest JSON spec inspector.

## Single-user MVP + explicit outs

**In scope**

- Two-column lab (stacks on narrow viewports): Astryx pane vs shadcn pane, CSS/token isolation per pane.
- Fixture tabs: **Settings** and **Dashboard** with shared deterministic sample state.
- Shared light/dark mode, synchronized editable preferences (notifications toggle, display name, density), reset, and copy/download spec JSON.
- Library/version labels on each column; spec maps components, props, and verified tokens per fixture.
- Bun tests: preferences sync, theme, reset, spec export shape.

**Out of scope**

- LLM/API, live data, auth, scoring/benchmarks, backend, CDN fonts, arbitrary prompt execution.

## Outcome-oriented slices

1. **Slice 1:** Vite + pins + Astryx CSS boundary + settings fixture with one working control on both sides.
2. **Slice 2:** Dashboard fixture + shared theme/preferences state.
3. **Slice 3:** Spec inspector + tests + README/evidence + browser smoke artifacts.

## Stack (rationale)

| Piece | Choice | Why |
|-------|--------|-----|
| Runtime | Bun | Repo standard; `minimumReleaseAge` gate |
| Build | Vite 8.3.5 + React 19 | Matches proven `ding-toast-lab` pins |
| Astryx | core + theme-neutral 0.7.8, StyleX 0.19.1 | Eligible release per dependency evidence |
| shadcn | CLI 4.22.1, minimalist base-mira components vendored from sibling app | Avoid mutable registry fetch; proven pins |
| Tests | `bun:test` | Fast unit tests for lab state/spec |

## Testing

- `bun test` — preferences, theme class, reset, spec JSON validity.
- `bun run typecheck` / `bun run build` — compile and production bundle.
- Browser smoke at ~1440×900 and ~390×844: tabs, theme, controls, spec copy/export; no console errors.

## Deferred

- More Astryx components beyond what 0.7.8 types confirm.
- Cloudflare Pages deploy path.
- Additional prompt fixtures.
