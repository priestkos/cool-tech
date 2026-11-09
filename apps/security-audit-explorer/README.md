# Security Audit Explorer

Offline browser for Cloudflare [security-audit-skill](https://github.com/cloudflare/security-audit-skill) run artifacts: `findings.json`, `coverage-ledger.json`, and `REPORT.md`. Example fixtures are **synthetic** and labeled **EXAMPLE DATA**.

## Commands

```bash
cd apps/security-audit-explorer
bun install
bun run dev      # http://127.0.0.1:5173
bun test
bun run typecheck
bun run build
bun run preview
```

## Architecture

- **Vite + React** UI with shadcn/base-ui components (minimal preset, system fonts).
- **Vendored validators** at `vendor/cloudflare-security-audit-skill/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/` — pinned commit `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` (MIT). See `PROVENANCE.md` for content hashes.
- **`src/lib/upstream-validation.ts`** — thin adapter calling `validateDocument` from the vendored `.cjs` files with `report-schema.json`.
- **Fixtures** under `src/fixtures/example-run-{alpha,beta}/` — validated before commit.

## Dependency age

- App-local `bunfig.toml` sets `[install] minimumReleaseAge = 259200`.
- Direct pins and evidence in `dependency-evidence.json`.
- Full lockfile audit: `node scripts/audit-lockfile-age.mjs` → `lockfile-age-audit.json` (396 resolved packages, all published before cutoff at install time).

## Limitations

- No live audits, agents, or API keys; no runtime network.
- REPORT preview is plain-text (no markdown renderer dependency).
- File drop accepts local files only.
