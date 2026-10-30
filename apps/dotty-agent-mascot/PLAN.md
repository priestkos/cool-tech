# Dotty Agent Mascot — PLAN

**Goal:** A one-screen playground where a simulated agent console drives Dotty's moods (listening, thinking, working, celebrating, alert, sleeping) in real time, with pickers to try every shape, expression, state and color.

Source buzz: https://x.com/roybarberuk/status/2115056957933445564 (@roybarberuk, Oct 2026). Official: https://dotty.roybarber.com and https://github.com/roybarber/dotty-botty (MIT).

## Single-user MVP
1. Header with links to the site, repo and X post, the pinned dotty-botty version, and a note that the agent is simulated.
2. Fake agent console: a chat box with 3–4 scripted prompt buttons and a free-text box.
   - Typing sets Dotty to `listening`. Sending goes to `thinking`, then each scripted tool call shows as a log line while Dotty is `working`. The reply streams in, then Dotty is `celebrating` before going back to `idle`.
   - One scripted prompt fails and shows `alert`. After about 20 s with no activity, Dotty goes to `sleeping`.
   - Free text gets a generic canned reply.
3. Big Dotty next to the console (with `label` for accessibility and `pokeable`), plus a "Boop" button that calls `poke()` and a "Blink" button that calls `blink()`.
4. Controls panel:
   - State picker (all 9, with a "driven by console" toggle so a manual pick overrides the script).
   - Shape picker (all 27) and an expression picker (12, plus "auto" = `null`).
   - Ink and spot color inputs with a few presets, a size slider, a follow-pointer switch and a reduced-motion switch.
   - A small read-only snippet showing the `<DottyBotty .../>` props you picked, with a copy button.
5. Shape gallery: a grid of all 27 shapes as small Dottys in the current state and colors; clicking one selects it.
6. Light/dark toggle, with Dotty's colors set through `--dotty-ink`/`--dotty-spot` so both themes look right.

**Out of scope:** a real LLM or the AI SDK, persistence, custom shape authoring, exporting SVG or GIF, multiple agents talking, deploy.

## Tasks (vertical slices)
1. Check that dotty-botty 1.0.0 and every pinned package are at least 3 days old. Scaffold Vite React TS (skip install), bunfig.toml, install the pinned versions, shadcn init (minimalist).
2. Big Dotty with the controls panel (state, shape, expression, colors, size, follow-pointer, reduced motion, poke and blink) and the props snippet.
3. Fake agent console with the script runner driving Dotty's state, the error run, the idle-to-sleeping timeout and the manual override.
4. Shape gallery and theme toggle.
5. A test for the script runner and a render smoke test. README (run steps, pinned versions with dates, the state mapping table, a note that the console is simulated), screenshot and video, PR.

## Stack
- `dotty-botty` 1.0.0: the tech being demoed, pinned past the 3-day rule; it exports its state, shape and expression name lists for the pickers.
- Vite + React 19 + TS: Dotty needs React 19, and this is the least wiring for a one-screen client with no backend.
- A small hand-written script runner (timers and a reducer): enough to simulate an agent without an LLM or key.
- shadcn/ui minimalist preset (card, button, select, toggle-group, slider, switch, input, textarea, scroll-area, badge): repo standard.

## Deferred
- Wiring Dotty to a real model with the AI SDK's `useChat` status: needs a key and a backend; the README shows the mapping instead.
- SVG or GIF export of a pose: nice extra, not needed to show the character.
- Several Dottys as a multi-agent "team" view: easy follow-up once the single console works.
- Deploy preview: comes later with the shared Cloudflare Pages project.
