# Mirage Terminal Lab

Offline browser lab for **Strukto Mirage** (`@struktoai/mirage-browser@0.1.0`, `@struktoai/mirage-core@0.1.0`): RAM mounts, real shell, session profiles, and a command log. This is an **independent** demo, not an official Strukto product.

## Goal

Show how Mirage runs client-side in a tab: grep/pipes/redirects across virtual mounts, policy differences between profiles, and honest policy errors—without cloud VFS or API keys.

## Commands

```bash
cd apps/mirage-terminal-lab
bun install          # bunfig.toml enforces 72h minimumReleaseAge
bun run typecheck
bun test
bun run build
bun run preview      # recommended UI path (production bundle)
bun run dev          # vite dev; may hit optional-peer prebundle noise from unused Mirage VFS stubs
bun run smoke        # Playwright desktop + mobile + artifact screenshot/video
```

## Architecture

- **UI:** Vite + React + TypeScript (shadcn base-mira).
- **Mirage:** `Workspace` from `@struktoai/mirage-browser` in the browser bundle; four in-memory `RAMVFS` mounts (`/docs`, `/s3`, `/data`, `/scratch`).
- **Shared logic:** `lib/mirage-lab.ts` (used by UI and Bun tests).
- **Profiles:** `analyst`, `intern`, `admin` via real `SessionProfile` trees (`paths.hide`, `commands` deny rules).
- **Trace:** Command log assembled at the `session.shell()` boundary; **Export trace JSON** downloads that log (Mirage 0.1.0 does not expose a single browser OTEL export hook in this build).

## Packages

Installed from npm:

- `@struktoai/mirage-browser@0.1.0` (2026-11-24T13:53:37Z)
- `@struktoai/mirage-core@0.1.0` (2026-11-24T13:56:25Z)

## Browser build notes

- **Works:** RAM mounts, `ls`/`cat`/`grep`/`find`/`wc`/`head`, pipes, `>`/`>>`, env vars, profile hide/deny with real `Permission denied` / `No such file` messages.
- **Machines:** Skipped—no in-process machine demo without optional peers (`e2b`, `pyodide`, `@pydantic/monty`, etc.).
- **Vite:** Production build succeeds (~19 MB `dist/`, main JS ~3.37 MB, ~1.07 MB gzip). Vite warns about Node builtins referenced by unused Mirage runtime paths; they are externalized and not used by this RAM-only lab.
- **Dev vs preview:** `bun run preview` after `build` is the reliable path; raw `vite` dev can fail if optional peer stubs are pre-bundled (e.g. Qdrant). `optimizeDeps.exclude` is set for Mirage packages to reduce this.

### Dependency ages (exact pins, checked 2026-11-27)

| Package | Version | Published (UTC) |
| --- | --- | --- |
| react | 19.3.1 | 2026-11-25 |
| vite | 8.3.5 | 2026-11-24 |
| typescript | 6.0.3 | 2026-11-22 |
| tailwindcss | 4.3.3 | 2026-11-23 |
| playwright | 1.64.1 | 2026-11-20 |
| shadcn | 4.22.1 | 2026-11-18 |

Lockfile: `bun.lock` (generated with `[install] minimumReleaseAge = 259200`).

## Credits

- [Mirage repo](https://github.com/strukto-ai/mirage) · [Product](https://www.strukto.ai/mirage) · [Docs](https://docs.mirage.strukto.ai) · [Launch post](https://x.com/zechengzh/status/2125308941190250618)
- Apache-2.0 — see `LICENSE` in the npm packages and `THIRD_PARTY_LICENSES.md`

## Unsupported commands

If a preset uses a command Mirage does not implement, the UI shows the package’s real stderr (same as the shell), not a custom message.