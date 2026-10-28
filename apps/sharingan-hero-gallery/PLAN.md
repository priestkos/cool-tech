# Sharingan Hero Gallery — PLAN

**Goal:** A gallery that installs five Sharingan heroes through the shadcn registry, shows each live, and lets you tweak its props, with an honest CSS fallback when WebGPU isn't available.

Source buzz: https://x.com/DilaneKombou/status/2114333976978751849 (@DilaneKombou, Oct 25 2026). Code: https://github.com/rasengan-dev/sharingan @ 567bc1ab (MIT).

## Single-user MVP
1. Heroes installed by `shadcn@4.22.1 add` from a registry built locally at commit 567bc1ab: aurora-mesh and ink-flow (WebGPU), split-headline, holo-card and beam-grid (DOM). Generated files committed under components/heroes and lib/sharingan.
2. Gallery: a hero list (name, WebGPU/DOM badge, description) and a large live preview of the selected hero.
3. Prop tweaker generated from the hero's zod config schema (colors, numbers, booleans, enums), a headline and CTA editor, Reset, and Copy JSX.
4. WebGPU status pill ("live" vs "CSS fallback") and a Force-fallback switch.

**Out of scope:** the other heroes and the v0.3 sections, Web Component (`<sg-*>`) usage, hosting our own registry, the hosted sharingan registry (unversioned), posters, persistence, auth, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for the Sharingan commit and every pinned package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Build the Sharingan registry at 567bc1ab in /tmp and serve it on localhost:3100 temporarily. Run `shadcn add` for the 5 heroes; render one DOM hero and one WebGPU hero on the page.
3. Gallery layout: hero list, live preview, metadata from meta.ts.
4. Schema-driven prop tweaker, content editor, Reset, Copy JSX.
5. WebGPU detection, fallback pill, Force-fallback switch.
6. Tests (schema-to-controls mapper, JSX generator), README (pins with dates, commit, license table, install path), screenshot and video with an honest mode label, PR.

## Stack
- Sharingan @ 567bc1ab via a local registry build and shadcn@4.22.1: the tech being demoed, installed the way it is meant to be, pinned to a public commit at least 3 days old.
- typegpu 0.12.8, the exact version the registry pins: Sharingan's WebGPU runtime.
- zod 4.6.7: hero content and config schemas, which also drive the tweaker.
- Vite + React + TS: least wiring for a client-only gallery; Sharingan heroes are React components.
- shadcn/ui minimalist preset (tabs, card, badge, slider, switch, select, input, button): repo standard, and already required by the registry flow.

## Deferred
- More heroes, and the v0.3 scroll sections: they need later commits or GSAP.
- Web Component demo (`<sg-ink-flow>`) in a plain HTML page.
- Saving tweaks to a URL or localStorage.
- Recording the WebGPU heroes live on a GPU-enabled machine if the VM had no WebGPU.
