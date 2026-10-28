# Bun fmt Playground — PLAN

**Goal:** A one-screen playground where you paste or pick a JS, TS, CSS or JSON snippet, run Bun's built-in `bun fmt` on it locally, and see a before/after diff, the elapsed time, and what the semi, quotes and print-width options change.

Source buzz: https://x.com/bunjavascript/status/2113213103660032209 (@bunjavascript, Oct 22 2026). Official: https://bun.com/blog/bun-v1.4.4 and https://bun.com/docs/format (Bun is MIT).

## Single-user MVP
1. Editor panel: a language picker (JS, TS, CSS, JSON), a sample picker with 2–3 deliberately messy snippets per language, and a textarea to paste your own code (max 100 KB).
2. Options bar (shadcn switches and slider): "Semicolons" (off → `--no-semi`), "Single quotes" (→ `--single-quote`), "Print width" 40–160 (→ `--print-width`). Below it, the exact `bun fmt` command line those options produce.
3. Format button: calls POST /api/format, which runs the real `bun fmt` on a temp file with `--no-config --no-editorconfig` plus the allowlisted flags.
4. Result panel: a side-by-side or unified diff (before vs after), a "changed / already formatted" badge, the elapsed time in ms, and a "Copy formatted" button. Formatter errors (e.g. invalid JSON) appear as a readable message, not a crash.
5. Status strip: the Bun version the server runs on, with a clear banner if it is older than 1.4.4.

**Out of scope:** the other 18 languages, `--check`/`--staged`/`--changed` git workflows, Prettier/oxfmt config files, import and Tailwind sorting, benchmarks against Prettier, persistence, auth, deploy.

## Tasks (vertical slices)
1. Install Bun 1.4.4 and confirm its version. Check that every pinned package is at least 3 days old. Scaffold Vite React TS (skip install), bunfig.toml, install the pinned versions, shadcn init (minimalist).
2. Bun.serve server: /api/status and /api/format (temp dir, fixed argv, allowlisted flags, size and time limits, cleanup). One `bun run dev` for the server and Vite, with the Vite proxy.
3. UI: language and sample pickers, textarea, options bar with live command line, Format button, diff and timing result panel, error state, version banner.
4. Tests for the flag builder and one /api/format round trip. README (run steps, Bun requirement, toggle-to-flag table, safety limits, pinned versions with dates), screenshot and video, PR.

## Stack
- Bun 1.4.4: the tech being demoed (`bun fmt` is new in this release), and the oldest stable release that has it, past the 3-day rule.
- Bun.serve: the formatter must run on the host, and this is the smallest server with no extra framework.
- Vite + React + TS with a dev proxy: least wiring for a one-screen client.
- A small pinned diff library: a readable before/after diff without writing a diff algorithm.
- shadcn/ui minimalist preset (select, textarea, switch, slider, button, card, badge): repo standard.

## Deferred
- More languages (Markdown, YAML, HTML, Vue, Svelte): easy to add once the four basics land.
- `--sort-imports` and `--sort-tailwindcss` toggles: nice extras, not needed to show the formatter.
- A side-by-side timing comparison with Prettier: needs Prettier installed and fair benchmarking; the release notes already cover it.
- Deploy preview: needs a host runtime with Bun, so it comes later.
