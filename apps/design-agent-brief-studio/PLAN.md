# Design Agent Brief Studio — PLAN

**Goal:** A one-page studio where you type a brief, pick a brand kit and get an on-brand HTML slide deck in a sandboxed preview, with brand checks and a one-click self-contained HTML export, all in a clearly labelled mock mode with no AI and no keys.

Source buzz: https://x.com/MattClark220/status/2115479468152438816 (@MattClark220, Oct 2026). Inspired by https://github.com/langchain-ai/design-agent (Apache-2.0, LangChain), read at commit 9fd563b. Unofficial demo, not made by or affiliated with LangChain.

## Single-user MVP
1. Brief panel: a textarea (max 2,000 chars) with three sample briefs, a slide-count select (3–8) and a format select (16:9 slide 1920×1080, square 1080×1080, portrait 1080×1350), plus a "Generate (mock)" button.
2. Mock generator: a deterministic brief → outline parser (title, key points, numbers), then slide templates (title, bullets, big stat, inline SVG bar chart, closing), with no AI, labelled "Mock mode" everywhere.
3. Brand kits: Example Studio (adapted from Design Agent's CC0 sample brand) plus two original fictional kits. Each kit has a palette, font stacks (local OFL fonts), radii, spacing, a voice line and an SVG mark, applied as `--brand-*` CSS variables.
4. Preview: the deck in an `iframe srcdoc` with `sandbox="allow-scripts"`, scaled to fit, with prev/next, a slide counter and a thumbnail strip. User text is always escaped.
5. Brand checks panel: colours on and off the palette (banned colours with replacements), max corner radius, WCAG text contrast and headline length, each with a pass/warn/fail line. An optional "custom accent" colour shows a check failing.
6. Export HTML: one self-contained file (inline CSS, SVG, base64 fonts and keyboard navigation) that opens offline. The header has links, the mock badge and the unofficial disclaimer.

**Out of scope:** real AI generation, Slack, LangSmith or Deep Agents, motion/video (HyperFrames, MP4), image generation, PDF/PNG export, editing slides by hand, uploading brand guides, saving or sharing, auth, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for the reference commit and every pinned package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Brand kits: convert Example Studio at 9fd563b, write the two original kits, vendor the used OFL fonts and logos with their licenses, and render one hard-coded title slide in the sandboxed iframe.
3. Brief → outline parser and slide templates (title, bullets, stat, SVG chart, closing), with the brief panel, samples, slide count and format.
4. Preview navigation, thumbnails and kit switching restyling the same deck; the mock badge and disclaimer.
5. Brand checks panel (palette, banned colours, radius, contrast, headline length, custom accent) and the self-contained HTML export.
6. Tests (parser, deck builder escaping and tokens, brand checks), README (pins with dates, reference commit, mock-mode notes, kit format, license table), screenshot and video, PR.

## Stack
- Own TypeScript template generator: the honest stand-in for the agent, deterministic and testable, with no keys and no network.
- Design Agent's brand-pack shape (tokens.json / tokens.css ideas) and its CC0 Example Studio kit: shows the "layouts only take your tokens" idea from the source.
- Vite + React + TS: least wiring for a client-only page.
- shadcn/ui minimalist preset (card, button, textarea, select, tabs, badge, sonner/toast, tooltip): repo standard for the studio panels.
- Inline SVG charts and base64 OFL fonts: exported decks stay single-file and offline.

## Deferred
- Real mode against the actual Design Agent (Slack, LangSmith, model keys): not exercised here; needs a hosted agent and credentials.
- Motion slides and MP4 export (HyperFrames): needs a headless browser and FFmpeg, beyond a client-only demo.
- PDF/PNG export and editing slides by hand: useful, but not needed to show brief → on-brand HTML.
- Importing a brand pack folder (tokens.json + brand.toml) from disk: the format is documented, so this is easy later.
- Deploy preview: optional per AGENTS.md; do it later on the shared Pages project.
