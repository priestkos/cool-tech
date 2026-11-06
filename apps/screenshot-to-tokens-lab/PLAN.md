# Screenshot to Tokens Lab — PLAN

**Goal:** One page that demos the Screenshot-to-Tokens idea offline: pick a sample dashboard, mock-extract a three-tier token tree, edit tokens live against a shadcn preview, and check contrast / dark mode — no Meta API keys.

Source buzz: https://x.com/precogpunk/status/2117740495526834365. Upstream: https://github.com/nhunsaker/screenshot-to-tokens (Apache-2.0), site https://s2t.sorbcloud.com. Unofficial community demo; fixture/mock only (upstream HEAD too new for a 3-day git pin).

## Single-user MVP
1. Fixture picker with 2–3 fictional dashboard screenshots + matching token JSON.
2. Mock extraction progress → load fixture tokens.
3. Editable primitive → semantic → component tree with cascade + reasons.
4. Live shadcn preview driven by CSS variables; light/dark.
5. Client-side WCAG contrast panel; rewrite tease; URL state.
6. Header with links, disclaimer, Apache-2.0 credit.

**Out of scope:** real SAM/Muse/Playwright/Sorb, git-pinning upstream, opening PRs, Meta keys, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for every package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Fixture schema + loader + tests.
3. Token tree + cascade + tests.
4. Preview + dark mode + contrast panel + tests.
5. Mock extraction UI, rewrite tease, URL state.
6. README (credits, pins with dates, licence table, mock caveats), screenshot and video, PR.

## Stack
- Bundled fixtures + client contrast math: the subject.
- Vite + React + TS, shadcn/ui minimalist preset: repo standard.

## Deferred
- Real pipeline / open-weights providers; pixel-diff verify; Sorb live bridge.
