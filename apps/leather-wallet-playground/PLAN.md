# Wallet Playground — PLAN

**Goal:** One page that configures the `@ncdai/wallet` shadcn registry component (card count, colours, labels, width), lets you try its real peek and pull-out behaviour, and copies a ready-to-paste snippet.

Source buzz: https://x.com/iamncdai/status/2117279668240044542 (Nov 2 2026). Component by Chánh Đại: https://github.com/ncdai/chanhdai.com (MIT), docs https://chanhdai.com/components/wallet, registry `@ncdai` → https://chanhdai.com/r/{name}.json. Unofficial community demo, not affiliated with or endorsed by Chánh Đại (ncdai) or chanhdai.com.

## Single-user MVP
1. Stage: the real Wallet (vendored from a pinned commit), centred, with "Replay intro" and a live "active card" readout.
2. Card editor: add/remove/reorder cards (max ~8); per card colour swatch, title, description, content.
3. Wallet settings: pocket label, width slider (shows scaling), light/dark.
4. Built-in behaviour panel: read-only peek/pull/spring/intro values from the source, how to test reduced motion.
5. Snippet: JSX for the current config + install command, with copy button and a pin note.
6. URL state so a link restores the wallet. Header with links and the "Unofficial community demo" line.

**Out of scope:** changing peek/pull distances or springs (not props; we don't fork the component), controlled open state, real payment data, other ncdai components, deploy.

## Tasks (vertical slices)
1. Check the start time, pick the newest wallet commit ≥ 72 h old, check the 3-day rule for every package. Scaffold Vite React TS (skip install), bunfig.toml, shadcn init (Base UI, mira), pinned installs.
2. Vendor wallet.tsx from a locally served copy of the pinned registry JSON; surface token; render a fixed sample wallet.
3. Card editor + wallet settings wired to URL state.
4. Behaviour panel, Replay intro, active-card readout.
5. Snippet generator + copy, header, light/dark.
6. Tests (URL round-trip, snippet, no remote host, vendored hash), README (pin, vendoring, real vs built-in knobs, brand note, pins with dates, license table), screenshot and video, PR.

## Stack
- `@ncdai/wallet` (vendored source at a pinned commit) + `motion@13.4.0` + `@base-ui/react`: the tech being demoed, at the author-tested versions.
- Vite + React + TS: least wiring for a client-only page.
- shadcn/ui minimalist preset (Base UI): repo standard, same primitives as the wallet.

## Deferred
- Exposing peek/pull distances or spring settings: would need forking the component.
- Card artwork/images and the docs' "passes" example layout: our own sample content is enough.
- Deploy preview: optional per AGENTS.md; later on the shared Pages project.
