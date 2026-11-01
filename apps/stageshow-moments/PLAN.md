# Stageshow Moments — PLAN

**Goal:** A one-page bento gallery of small everyday app moments (music player, calendar invite, payment confirmation, chat bubble and a stat tile), each a polished faux UI in which one thing happens, with Before / After toggles and short caused animations, built by following Benji Taylor's Stageshow skill with fictional brands only.

Source buzz: https://x.com/benjitaylor/status/2116593247854453244 (@benjitaylor, Oct 31 2026). Guidance from https://github.com/benjitaylor/skills/tree/main/stageshow (MIT, Benji Taylor), read at commit 8020574. Unofficial demo, not made by or affiliated with Benji Taylor; no Stageshow code or assets included.

## Single-user MVP
1. Bento grid: one hero tile and four or five supporting tiles planned with a tile table (hero UI, components, a stat or statement), rounded tiles on a gap, copy short and outside each picture.
2. Moments: Wavelet music player (hero, with one caused cursor), Dayline calendar invite, Tallypay payment confirmation with a receipt satellite, Natter chat bubble with a delivered receipt, and a stat tile. Each has a 3 to 7 real-string budget and quiet filler.
3. Before / After: a toggle per moment, Replay that plays 3 to 5 beats to the landed After, and global All Before / All After. Data snaps back, never rewinds in view.
4. Motion: own CSS and a tiny timeline helper with the skill's travel and arrival curves; the grid plays once on load with an 80–120 ms stagger; posters for reduced motion and a reduced-motion switch.
5. Responsive: recomposed layouts at ~550 px and a stacked 358 px phone column with compact UI tiles; an Open view showing one moment large.
6. Header and footer: links, the unofficial and fictional-brands disclaimer, and "Illustrations, not working apps".

**Out of scope:** copying the Stageshow kit or examples, real brands or logos, photos, a cursor in more than one tile, long hero loops, video export or the filming scripts, theming beyond light (dark only if time allows), persistence, auth, deploy.

## Tasks (vertical slices)
1. Check that every pinned package is at least 3 days old. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Tile table in the README, the bento grid shell with one Stage-like container per tile, and the Wavelet hero moment's still (poster) at native size.
3. Timeline helper, Before / After toggle and Replay on the hero with its cursor; reduced-motion path.
4. Dayline, Tallypay, Natter moments and the stat tile, each still first, then its one story.
5. Global All Before / All After, the Open view, load stagger, recomposed 550 px and 358 px layouts, disclaimers.
6. Tests (timeline, reduced motion, moment registry), self-review against verify.md and review.md, README (pins with dates, reference commit, tile table, rules applied, license table), screenshots and video, PR.

## Stack
- Own React components and CSS following Stageshow's documented rules: shows the skill's craft without copying its kit while its commit is under the 3-day rule.
- Own tiny timeline helper (beats with delays, snap reset, cancel) plus CSS transitions: no animation dependency, deterministic and testable.
- Vite + React + TS: least wiring for a client-only page.
- shadcn/ui minimalist preset (toggle-group, button, switch, tooltip, dialog): repo standard for the page shell and controls only.
- lucide-react: generic icons inside the fictional products.

## Deferred
- Using the actual Stageshow kit (`Stage`, `Act`, `Window`, `Roll` …): MIT allows it, but commit 8020574 is under 3 days old until Nov 3 23:37 IST; a follow-up could port a moment onto the kit.
- Filming and gating with Stageshow's `film.mjs` (Playwright): useful for checks, but a heavy dev dependency for an MVP.
- Dark theme and more moments (upload, lock-screen notification): only if every tile is designed for them.
- Deploy preview: optional per AGENTS.md; do it later on the shared Pages project.
