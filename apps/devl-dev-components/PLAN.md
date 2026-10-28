# devl.dev Components — PLAN

**Goal:** A single showcase page that puts four of devl.dev's open-source components (JSON Explorer, Liquid Slider, File Tree, Voice Note) to work in one small "agent dev console" so you can feel how they behave.

Source buzz: https://x.com/SeanBrydon13/status/2114768649336869231 (@SeanBrydon13, Oct 2026). Official: https://devl.dev and https://github.com/sean-brydon/devl.dev (MIT for devl's own code).

## Single-user MVP
1. Header with links to devl.dev, the repo and the X post, and a note that the components were copied from a pinned commit (SHA and date shown).
2. JSON Explorer card: a made-up API response (an agent run with steps, tool calls and costs) with search, fold/unfold and copy-path; a small textarea to paste your own JSON (invalid JSON shows an error instead of crashing).
3. Liquid Slider card: two sliders (e.g. "temperature" and "max steps") whose values drive a small live readout, showing the droplet thumb and value bubble.
4. File Tree card: a made-up project tree with git-change markers; keyboard navigation, F2 rename and drag to move; selecting a `.json` file loads it into the JSON Explorer.
5. Voice Note card: a voice-message bubble with play/pause, scrub, speed chip and word-by-word transcript (simulated playback, no audio file needed).
6. Light/dark toggle so the components can be seen in both themes.

**Out of scope:** the other 140 devl components, coss ui (AGPL), real audio recording, persistence, deploy.

## Tasks (vertical slices)
1. Check that the devl commit and every pinned package are at least 3 days old. Scaffold Vite React TS (skip install), bunfig.toml, install pinned versions, shadcn init (minimalist), add input-group, tooltip, kbd.
2. Copy the four components from the pinned commit into `src/components/devl/` with source headers; swap coss imports for shadcn's; get them compiling.
3. Showcase page with the four cards and sample data; File Tree to JSON Explorer wiring; theme toggle.
4. README (run steps, pinned versions with dates, devl commit, list of edits to devl code), THIRD_PARTY_NOTICES.md, screenshot and video, PR.

## Stack
- devl.dev components copied from commit 2328dbc (Oct 25, 2026): the tech being demoed; the registry URL is unversioned, so a pinned commit is the only way to honour the 3-day rule.
- `motion` 14.6.0 + `lucide-react` 1.61.0: the components' own runtime deps, pinned past the 3-day rule.
- shadcn/ui minimalist preset with input-group, tooltip, kbd: MIT stand-ins for the AGPL coss ui pieces, and the repo standard.
- Vite + React + TS: least wiring for a one-screen client with no backend.

## Deferred
- Installing via `shadcn add https://devl.dev/r/...`: unversioned and pulls AGPL coss ui; revisit if devl ships versioned or MIT-only items.
- More devl components (Liquid Switch, Log Stream, Terminal): easy follow-ups once this page exists.
- Real voice recording and audio files: simulated playback shows the component.
- Deploy preview: comes later with the shared Cloudflare Pages project.
