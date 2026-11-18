# Bottle Studio Lab

Vite/Bun wrapper around the **real** [bottle-studio](https://github.com/amirmushichge/bottle-studio) v1.0.0 single-file app (MIT). The 3D stage, controls, shaders, and render loop are vendored upstream code — not a clean-room reimplementation.

## Pinned upstream

| Field | Value |
|---|---|
| Tag | `v1.0.0` |
| Commit | `de876d4fb2bd3a37654647d4c585170237fe4123` |
| Committer UTC | 2026-11-06T19:56:27Z |
| Vendored file | `vendor/amirmushichge-bottle-studio/de876d4/index.html` |
| License | MIT — `THIRD_PARTY_LICENSES/amirmushichge-bottle-studio-LICENSE.txt` |

Provenance and content hash: `vendor/amirmushichge-bottle-studio/de876d4/PROVENANCE.md`.

## Commands

```bash
cd apps/bottle-studio-lab
bun install          # bunfig minimumReleaseAge 259200
bun run prepare:upstream   # copies three@0.170.0 + patched stage to public/
bun run dev          # http://localhost:5173 (runs prepare via predev)
bun run test
bun run typecheck
bun run build
bun run preview
```

## Architecture

- `vendor/amirmushichge-bottle-studio/de876d4/index.html` — verbatim upstream (73 841 bytes).
- `scripts/prepare-upstream.mjs` — lab-only patches: local three import map, remove Google Fonts `<link>` for offline use.
- `public/bottle-studio/` — generated runtime (gitignored vendor tree; regenerated on install/dev/build).
- `src/upstream/bottle-studio-api.ts` — testable DEFAULTS/presets/clamps/profile math extracted from upstream.
- `src/features/studio/UpstreamStage.tsx` — iframe host for the vendored stage.

## Verification

| Check | Command / note |
|---|---|
| Unit tests | `bun test` (upstream API) |
| Types | `bun run typecheck` |
| Production build | `bun run build` |
| Bundle size | `gzip -c dist/assets/*.js` after build |
| Browser | Desktop ~1440×900 and mobile ~390×844; no console errors; no unexpected network (stage is local) |

## Credits

- **Bottle Studio** — Amir Mushich, MIT: https://github.com/amirmushichge/bottle-studio  
- **three.js** — vendored 0.170.0 per upstream import map (npm publish 2026-10-30, eligible under launch cutoff).