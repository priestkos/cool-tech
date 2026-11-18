# Vendored Bottle Studio (v1.0.0)

| Field | Value |
|---|---|
| Repository | https://github.com/amirmushichge/bottle-studio |
| Tag | `v1.0.0` |
| Commit | `de876d4fb2bd3a37654647d4c585170237fe4123` |
| Committer UTC | 2026-11-06T19:56:27Z |
| License | MIT (see `THIRD_PARTY_LICENSES/amirmushichge-bottle-studio-LICENSE.txt`) |

## Files

| Path | SHA-256 |
|---|---|
| `index.html` | `6d7e5c15ec39e2d59860ef4d1c16954c0516946fc6adfb536e6db5cc5d75e02f` |

## Runtime copy

`bun run prepare:upstream` writes `public/bottle-studio/index.html` with two lab-only edits:

1. **Offline three.js** — import map points at `three@0.170.0` copied from `node_modules` (same revision the upstream CDN pin uses).
2. **No Google Fonts fetch** — font `<link>` tags removed so the stage runs offline; UI falls back to system sans; emblem typography uses upstream canvas draw + optional `document.fonts` timeout.

No changes to bottle geometry, shaders, or control logic.