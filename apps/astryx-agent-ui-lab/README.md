# Astryx Agent UI Lab

Compare the same local **settings** and **dashboard** prompt fixtures rendered by real [Astryx](https://github.com/meta/astryx) (`@astryxdesign/core@0.7.8`, `@astryxdesign/theme-neutral@0.7.8`) versus vendored **shadcn/ui** (CLI 4.22.1, base-mira components). Shared sample preferences, light/dark mode, reset, and an illustrative JSON spec inspector.

**Integration:** Real Astryx packages (not a bespoke reimplementation). shadcn components were copied from eligible sibling demos in this monorepo to avoid pulling mutable registry content at install time.

## Commands

```bash
cd apps/astryx-agent-ui-lab
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

## Architecture

- `src/features/astryx/*` — Fixture components (rendered inside isolated frame).
- `astryx-frame.html` — Separate document loading **only** Astryx reset/CSS/theme (no Tailwind Preflight).
- `src/features/shadcn/*` — Tailwind/shadcn fixtures (scoped `.dark` on `.shadcn-pane`).
- Parent/child sync via `postMessage` (`src/astryx-frame/protocol.ts`).
- `src/lab/*` — Shared preferences, spec mapping, tests.
- CSS: layered imports per Astryx Vite + Tailwind co-install docs (`reset.css` → `astryx.css` → `theme-neutral/theme.css`).

## Licenses

- Application code: MIT (monorepo default).
- `@astryxdesign/core` / `@astryxdesign/theme-neutral`: MIT — Meta Open Source.
- shadcn/ui component sources: MIT (see [ui.shadcn.com](https://ui.shadcn.com)).

## Evidence

| File | Contents |
|------|----------|
| `dependency-evidence.json` | Summary + pointers |
| `dependency-evidence-lockfile-audit.json` | All 407 resolved packages: npm `published`, license, `eligibleAtCutoff` |
| `shadcn-component-provenance.json` | Registry lineage at commit `8a353667…` (eligible before cutoff) |

## Limitations

- Spec JSON is **illustrative** — maps fixtures to known component APIs, not generated UI output.
- No backend, auth, LLM, or live metrics; dashboard numbers are static fixtures.
- shadcn files are vendored variants (not byte-identical to registry raw); provenance is commit-traced, not sibling-demo-only.
- Lab **header chrome** still uses Tailwind on the parent page; only Astryx **preview** runs in an iframe document.
