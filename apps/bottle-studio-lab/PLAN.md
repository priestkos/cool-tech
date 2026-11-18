# Bottle Studio Lab — PLAN

**Goal:** Wrap the real [bottle-studio](https://github.com/amirmushichge/bottle-studio) v1.0.0 single-file MIT app in a Bun/Vite lab shell with offline three.js vendoring and upstream-pinned tests.

## Single-user MVP

- Vendored `index.html` at commit `de876d4fb2bd3a37654647d4c585170237fe4123` (≥72h before launch).
- Full-screen iframe stage + thin shadcn header (pin, links, “open stage”).
- `prepare:upstream` copies three@0.170.0 and patches import map / removes Google Fonts for offline smoke.
- Bun tests on extracted upstream state API (`src/upstream/bottle-studio-api.ts`).

**Out of scope:** Re-skinning upstream controls in React, forked geometry, CDN runtime, deploy.

## Tasks (vertical slices)

1. PLAN + provenance + THIRD_PARTY_LICENSES + vendor tree.
2. `prepare-upstream.mjs` + `bottle-studio-api` + tests.
3. React lab shell (`App`, `UpstreamStage`).
4. README, tracking record, artifacts, PR scope check.

## Stack

- **Vite 8.3.5 + React 19.3.1** — lab chrome only; stage is vendored HTML.
- **three 0.170.0 (dev, vendored to public)** — matches upstream import map pin.
- **shadcn 4.22.1 (base-mira)** — header buttons/badge.

## Testing

- `bun test` — upstream DEFAULTS, clamps, presets, prof/readouts.
- `bun run typecheck` / `bun run build` — lab shell + prepare hook.
- Browser smoke — iframe stage desktop + mobile, console/network check.

## Deferred

- Live React bindings to upstream `S` state; GLTF export; multi-user.