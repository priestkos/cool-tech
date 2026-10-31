# Design Agent Brief Studio

**Unofficial demo inspired by LangChain's [Design Agent](https://github.com/langchain-ai/design-agent). Not made by or affiliated with LangChain; no AI runs here (mock mode).**

One-page browser studio: type a brief, pick a brand kit, preview an on-brand HTML slide deck in a sandboxed iframe, run brand checks, and export a single self-contained `.html` file. Generation is **mock mode** — deterministic scripted templates, no LLM and no API keys.

Source buzz: [Matt Clark on X](https://x.com/MattClark220/status/2115479468152438816).

Design Agent reference (read-only inspiration): commit [`9fd563be8be0f3a2c956599f8ed4672ae0d1f281`](https://github.com/langchain-ai/design-agent/commit/9fd563be8be0f3a2c956599f8ed4672ae0d1f281) (2026-10-27T10:24:45-07:00). Example Studio brand data and logos are CC0-1.0 from that pin.

## Run

```bash
cd apps/design-agent-brief-studio
bun install
bun run dev
```

Open the printed local URL. `bun test` runs parser, deck builder, and brand-check tests.

## Mock mode vs real Design Agent

| This demo | LangChain Design Agent |
|-----------|------------------------|
| Browser-only TypeScript templates | Python Deep Agent (Slack, sandbox, skills) |
| Same brief → same deck every time | Claude + tools, non-deterministic |
| No keys, no network | LangSmith, model keys, Docker demo available |
| HTML deck export | Slides, charts, motion (HyperFrames), wiki |

The UI shows **Mock mode: scripted templates, no AI** and a disabled **Real mode (not exercised)** note linking upstream.

## Brand kits

Three local kits share the same shape as Design Agent brand packs (`tokens.json` / `tokens.css` ideas):

1. **Example Studio** — adapted from Design Agent's CC0 sample (palette, radii, Geist + Fragment Mono, SVG mark).
2. **Ledger & Line** — original editorial kit (Fraunces + IBM Plex Mono).
3. **Nexus Grid** — original high-contrast tech kit (Inter + Fira Code).

Each kit defines `--brand-color-*`, `--brand-font-*`, radii, spacing, voice line, and an SVG mark. To add a kit, extend `src/lib/brands/kits.ts` and vendor any new OFL fonts under `src/assets/fonts/` with license text in `THIRD_PARTY_LICENSES/fonts/`.

## Brand checks

- Signal / custom accent on palette; banned colours with suggested token replacements
- Max corner radius (12px cap from pack)
- WCAG AA contrast for ink on paper
- Headline length vs kit limit

## Export

**Export HTML** downloads `<brand-slug>-<brief-slug>.html` with inline CSS, inline SVG charts and logos, base64 `@font-face` fonts, and arrow-key slide navigation. No external URLs; opens offline.

Preview uses `iframe srcdoc` with `sandbox="allow-scripts"` (no `allow-same-origin`). User brief text is HTML-escaped.

## Pinned dependencies (verified 2026-10-31, ≥72h old)

| Package | Version | Publish date (UTC) |
|---------|---------|-------------------|
| create-vite | 9.3.1 | 2026-10-20 (scaffold) |
| shadcn | 4.22.1 | 2026-10-18 |
| react / react-dom | 19.3.1 | 2026-10-14 |
| @types/react / @types/react-dom | 19.3.0 | 2026-09-09 |
| vite | 8.3.5 | 2026-10-21 |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 |
| typescript | 6.0.3 | 2026-04-16 |
| tailwindcss / @tailwindcss/vite | 4.3.3 | 2026-07-16 |
| lucide-react | 1.61.0 | 2026-10-21 |
| @types/bun | 1.4.4 | 2026-10-23 |

Install policy: `bunfig.toml` sets `minimumReleaseAge = 259200` (3 days).

## Licenses

| Component | License |
|-----------|---------|
| This demo app | Same as monorepo |
| Design Agent (inspiration only) | Apache-2.0 — see `THIRD_PARTY_LICENSES/design-agent-LICENSE.txt`, `design-agent-NOTICE.md` |
| Example Studio brand + logos | CC0-1.0 — `THIRD_PARTY_LICENSES/example-studio-CC0-LICENSE.txt` |
| Geist, Fragment Mono, Fraunces, IBM Plex Mono, Inter, Fira Code | OFL-1.1 — `THIRD_PARTY_LICENSES/fonts/` |
| npm dependencies | See table below |

| npm package | License |
|-------------|---------|
| react, react-dom, vite, @vitejs/plugin-react, shadcn, tailwindcss, @tailwindcss/vite, lucide-react, zod, clsx, cn, class-variance-authority, tailwind-merge, tw-animate-css, sonner, @base-ui/react, @hugeicons/* | MIT |
| typescript | Apache-2.0 |
| lucide-react | ISC |
| @types/* | MIT |
