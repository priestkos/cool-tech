# Vendored Cloudflare security-audit-skill

MIT License — Copyright (c) 2025-2026 Cloudflare, Inc. See `LICENSE` in this directory.

| Field | Value |
| ----- | ----- |
| Upstream | https://github.com/cloudflare/security-audit-skill |
| Pinned commit | `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` |
| Committer date (UTC) | 2026-09-14T19:28:54Z |

## Files vendored

| Path | Content SHA-256 |
| ---- | ----------------- |
| `report-schema.json` | `6575c9de4a62255699ea052ebf9a49ebfb373a32891bcd89af6f55cc84b35519` |
| `validate-findings.cjs` | `e85f232e36bfac0f866f244da50376692d6b45c690beadcb00608b0e6c8b5283` |
| `validate-coverage-ledger.cjs` | `2eb280bd2e33c002916f86db9b29f9edfedb6454e5db973c766290465b868ac8` |

Only schema and validators are vendored. Hunting/companion markdown from the skill is not copied.

Browser bundles in `src/vendor-shim/*.bundle.js` are generated from these `.cjs` files via `bun run vendor:bundle` (ESM target, no source edits).
