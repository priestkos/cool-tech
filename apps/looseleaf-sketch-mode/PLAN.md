# Looseleaf Sketch Mode — PLAN

**Goal:** One page that renders the same small settings and dashboard screens from identical JSX in plain shadcn/ui and in Looseleaf, side by side or flipped with a "Sketch mode" toggle, plus a small gallery of the components used.

Source buzz: https://x.com/kevin_t_ngo/status/2116929610122395995 (Kevin Ngo, Nov 1 2026). Code: https://github.com/kevintngo/looseleaf (MIT), site https://kevintngo.github.io/looseleaf/. Unofficial community demo, not affiliated with Kevin Ngo or the Looseleaf project.

## Single-user MVP
1. App shell: header (links, "Unofficial community demo" line), view switch (Side by side / Sketch mode flip), screen switch (Settings / Dashboard / Gallery), light/dark toggle.
2. Two isolated renderers (plain shadcn page and Looseleaf page, same-origin iframes) driven by the same URL state, so Looseleaf's theme never restyles the plain side.
3. Settings screen (one JSX source, two kits): tabs (Profile / Notifications), inputs + textarea in a react-hook-form form with validation, switches, a volume slider, a save button with a toast, and a "Delete account" confirm dialog.
4. Dashboard screen: stat cards with badges, a tabbed card, buttons; fake data.
5. Gallery: each of the ~10 components (button variants, tabs, switch, slider, card, dialog, input, textarea, label, badge, form) in both kits, with short notes.
6. Fonts and Looseleaf files vendored from one pinned Looseleaf commit; no runtime requests to the Looseleaf site.

**Out of scope:** Looseleaf blocks, stickers, mascot and art packs; charts; the other ~110 components; RTL; editing tokens live; deploy.

## Tasks (vertical slices)
1. Check the start time, pick the newest Looseleaf commit >= 72 h old (not older than 3343cad), check the 3-day rule for every package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (Radix base, mira).
2. Plain kit: add the shadcn components; plain page renders the settings screen.
3. Looseleaf kit: vendor from a local copy of the pinned registry into src/looseleaf/, local Kevin Sans fonts, Looseleaf page renders the same screen in InkProvider.
4. Shell: multi-page Vite entries, iframes, view/screen/theme state in the URL, Sketch mode flip.
5. Dashboard screen and gallery page.
6. Tests (form rules, view state, no remote host), README (pin, vendoring, isolation, differences, licenses), screenshot and video, PR.

## Stack
- Looseleaf (vendored registry source at a pinned commit): the tech being demoed.
- shadcn/ui 4.22.1, Radix base, mira preset: the plain baseline with the same primitives Looseleaf uses.
- Vite multi-page + React + TS: separate CSS per kit with no extra wiring.
- react-hook-form: what both kits' `form` component expects.

## Deferred
- Live token editing and the compact/calm densities as a first-class control: nice, not needed to show the swap.
- Looseleaf blocks (login, sidebar, dashboard-01): bigger installs; the point is the drop-in swap.
- Single-document rendering with scoped themes: needs care around `:root` tokens; iframes are safer for now.
- Deploy preview: optional per AGENTS.md; later on the shared Pages project.
