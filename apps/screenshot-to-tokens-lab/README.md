# Screenshot to Tokens Lab

Unofficial community demo. Not affiliated with Metatoy, nhunsaker, Sorb, or Meta. Inspired by [Screenshot to Tokens](https://github.com/nhunsaker/screenshot-to-tokens) (Apache-2.0). Extraction is mocked from bundled fixtures — no API keys.

One-page, browser-only playground: pick a fictional dashboard screenshot, run mock extraction, browse/edit a three-tier design token tree (primitive → semantic → component), live-apply tokens to a shadcn preview, check WCAG contrast, and peek at CSS rewrite examples. No backend, no LLM, no API keys.

Source buzz: https://x.com/precogpunk/status/2117740495526834365

## Run

```bash
cd apps/screenshot-to-tokens-lab
bun install
bun run dev
```

Also: `bun test`, `bun run lint`, `bun run build`.

## Mock caveats

- **Run extraction** is cosmetic staging only; token JSON is bundled per fixture.
- **Rewrite panel** shows static before/after strings, not a real CSS rewriter.
- **Upstream pipeline** (Playwright, SAM, Muse Spark, Sorb) is intentionally not integrated; upstream HEAD was too new for a 3-day git pin at build time.

## Pinned dependencies (publish dates)

Verified with `npm view <pkg>@<version> time.modified` on 2026-11-06 (72h minimum-age gate via `bunfig.toml`).

| Package | Version | Published (UTC) |
| --- | --- | --- |
| react | 19.3.1 | 2026-11-05 |
| react-dom | 19.3.1 | 2026-11-05 |
| vite | 8.3.5 | 2026-11-05 |
| @vitejs/plugin-react | 6.1.2 | 2026-11-02 |
| typescript | 6.0.3 | 2026-11-05 |
| tailwindcss | 4.3.3 | 2026-11-05 |
| @tailwindcss/vite | 4.3.3 | 2026-11-05 |
| @types/react | 19.3.0 | 2026-10-04 |
| @types/react-dom | 19.3.0 | 2026-10-04 |
| @types/bun | 1.4.4 | 2026-10-23 |
| @types/node | 24.19.2 | 2026-10-28 |
| oxlint | 1.90.0 | 2026-11-03 |
| lucide-react | 1.61.0 | 2026-11-05 |
| cn | 0.5.0 | 2026-11-02 |
| shadcn (CLI) | 4.22.1 | 2026-10-27 |
| @base-ui/react | 1.9.0 | (via shadcn init lock) |
| @hugeicons/core-free-icons | 4.4.0 | (via shadcn init lock) |
| @hugeicons/react | 1.1.10 | (via shadcn init lock) |
| class-variance-authority | 0.7.1 | (via shadcn init lock) |
| tw-animate-css | 1.4.0 | (via shadcn init lock) |

System UI stack only — no remote font packages.

## Licence table

| Component | Licence |
| --- | --- |
| This demo app | MIT (repo default) |
| Inspired upstream Screenshot to Tokens | Apache-2.0 |
| React, Vite, Tailwind, shadcn/ui ecosystem | MIT (see package manifests) |
| lucide-react | ISC |
| TypeScript | Apache-2.0 |
