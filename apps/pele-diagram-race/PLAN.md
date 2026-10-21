# Pele Diagram Race — PLAN

**Goal:** A one-page playground that renders the same Mermaid source with Pele and mermaid.js side by side, so you can see the speed and size difference and restyle Pele live.

Source buzz: https://x.com/kepano/status/2111472054293913749 (kepano, Oct 17 2026). Official: https://github.com/obsidianmd/pele, https://pele.run/.

## Single-user MVP
1. Left: Mermaid source editor (textarea is fine) with preset chips: flowchart, sequence, gantt, mindmap, sankey, plus 1-2 more Pele supports.
2. Right: two panels, Pele render and mermaid.js render, both updating live (debounced) as you type.
3. Timing bar: last render time (ms, via performance.now) for each renderer, a "Race x50" button that renders N times and shows the average and the speedup ratio, and each library's bundle size (measure the built chunk sizes or the published package size; label which).
4. Theme panel: shadcn sliders and color swatches that change Pele's CSS variables (the documented --pele-* variables) live, without re-rendering.
5. "Shrink container" toggle/slider that narrows the Pele panel to show its responsive relayout.
6. Render errors shown inline per panel, never crash the page.

**Out of scope:** saving/sharing diagrams, auth, backend, deploy.

## Tasks (vertical slices)
1. Read Pele README/docs. Scaffold Vite React TS (skip install), add bunfig.toml, install pinned pele@1.6.0 and mermaid@12.2.0, shadcn init (minimalist).
2. Editor + presets + Pele panel.
3. mermaid.js panel + timing bar + race button.
4. Theme panel and shrink toggle.
5. README, screenshot + video, PR.

## Stack
- Vite + React + TS: least wiring for a static client app.
- pele@1.6.0 and mermaid@12.2.0: the tech being compared, pinned for the 3-day rule.
- shadcn/ui minimalist preset: repo standard.

## Deferred
- URL-shareable diagrams, more presets, deploy preview, tests beyond one for the timing/average helper.
