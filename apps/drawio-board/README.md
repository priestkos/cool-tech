# Diagram Desk

One-page diagram desk that embeds the real [draw.io](https://www.drawio.com) editor via [`@drawio/react`](https://www.drawio.com/react) (Apache-2.0; [source](https://github.com/jgraph/drawio-react)).

## Features

- Starter templates (flowchart, architecture, org chart)
- Paste Mermaid and convert to an editable draw.io diagram
- Save diagrams in `localStorage` (open, rename, delete)
- Export PNG and SVG from custom toolbar buttons

## Run locally

```bash
cd apps/drawio-board
bun install
bun run dev
```

Open the URL Vite prints (default http://localhost:5173).

## Links

- [@drawio/react on npm](https://www.npmjs.com/package/@drawio/react)
- [React component docs](https://www.drawio.com/react)
- [Announcement](https://x.com/drawio/status/2112936953737797882)

## Notes

- Diagrams stay in your browser; there is no backend.
- The editor loads from `embed.diagrams.net` by default (see `@drawio/react` README for self-hosting with `baseUrl`).
