# Diagram Desk — PLAN

**Goal:** A one-page diagram desk that embeds the real draw.io editor via @drawio/react, with starter templates, Mermaid import, local saves and exports.

Source buzz: https://x.com/drawio/status/2112936953737797882 (draw.io, Oct 21 2026). Official: https://www.drawio.com/react, https://github.com/jgraph/drawio-react.

## Single-user MVP
1. Sidebar of starter templates (flowchart, architecture, org chart) that open in the embedded editor.
2. "Paste Mermaid" panel that converts Mermaid into an editable draw.io diagram (via the component's documented Mermaid support).
3. Save to localStorage with a saved-diagrams list (open, rename, delete).
4. Export buttons for PNG and SVG.
5. Errors shown inline, never crash the page.

**Out of scope:** sharing, auth, backend, deploy, collaboration.

## Tasks
1. Read docs; scaffold; bunfig.toml; install pinned @drawio/react@0.1.0; shadcn init.
2. Editor + templates.
3. Mermaid import.
4. Saves + exports.
5. README, screenshot + video, PR.
