# Talking Marble Voice Lab — plan

## Goal

One offline browser lab that exercises the real `talking-marble@0.1.0` npm package: React `TalkingMarble` and `<talking-marble>` side by side, shared controls, palettes, audio reactivity, presets, and accessibility — no voice SDKs or network at runtime.

## MVP scope

- Dual viewers synced from one lab state object
- State grid (7 built-ins + custom preset state), emotion grid (+ none)
- Named palettes + four colour custom editor
- Level slider (auto `speaking` when level &gt; 0), mock oscillator audio, optional mic after gesture
- Size, halo, pause, decorative/label/aria demo, About panel
- Bun unit tests on package exports + attribute helpers + no runtime fetch in app source
- Playwright smoke (desktop + mobile), screenshot + video for PR

## Out of scope

- OpenAI / ElevenLabs / LiveKit wiring
- Mic in smoke video (optional in UI only)
- Deploy to Cloudflare Pages

## Stack

- Vite 8 + React 19 + TypeScript 6 + shadcn base-mira + Tailwind 4
- Bun: install, test, scripts
- Playwright: browser smoke only

## Deferred

- Automated visual regression on WebGL canvas
- Saved palette presets in localStorage