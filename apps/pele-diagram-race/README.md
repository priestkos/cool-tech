# Pele Diagram Race

Side-by-side playground comparing [Pele](https://github.com/obsidianmd/pele) and [mermaid.js](https://mermaid.js.org) on the same Mermaid source. Docs and playground: [pele.run](https://pele.run/).

## Run locally

```bash
cd apps/pele-diagram-race
bun install
bun run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Scripts

- `bun run dev` — development server
- `bun run build` — production build (also writes `src/lib/bundle-sizes.generated.json` from Vite chunks)
- `bun run test` — unit tests for timing helpers
- `bun run preview` — preview the production build

## What to try

1. Pick a preset chip or edit the Mermaid source (updates are debounced).
2. Compare last render times and run **Race ×50** for averages.
3. Tweak **Pele theme** CSS variables (`--pele-*`) — colors change without re-rendering.
4. Enable **Shrink Pele container** to watch responsive relayout.
