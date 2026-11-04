# Looseleaf Sketch Mode

**Unofficial community demo. Not affiliated with Kevin Ngo or the Looseleaf project.**

Compare the same React screens built once against plain [shadcn/ui](https://ui.shadcn.com/) (Radix base, mira preset) and [Looseleaf](https://github.com/kevintngo/looseleaf) (hand-drawn shadcn registry). Toggle **Sketch mode**, switch light/dark, and browse Settings, Dashboard, and a component gallery.

- Source buzz: [Kevin Ngo on X, Nov 1 2026](https://x.com/kevin_t_ngo/status/2116929610122395995)
- Looseleaf repo: https://github.com/kevintngo/looseleaf (MIT)
- Upstream site (not loaded at runtime): https://kevintngo.github.io/looseleaf/

## Run

```bash
cd apps/looseleaf-sketch-mode
bun install
bun run dev
```

Open the URL Vite prints (default `http://localhost:5173/`). `bun run build` and `bun test` must pass from a clean clone.

## Looseleaf pin & vendoring

| Item | Value |
|------|--------|
| Looseleaf commit | `3343cadb65f9d948818276198272388c99b9f380` |
| Commit time | 2026-11-01 05:54:51 -0800 |
| 72h rule at start | Demo started 2026-11-04T14:08Z; only this commit qualified (tip `4bdb647` was still &lt;72h old). |

Vendored files live under `src/looseleaf/`. See `scripts/vendor-looseleaf.md` for the exact install flow (local registry mirror, shadcn 4.22.1, item list).

**Manual vendored edit:** `KEVIN_SANS_CSS` in `src/looseleaf/lib/ink/react/defs.tsx` → `/fonts/kevin-sans.css`. `sketch.html` also includes `<link rel="stylesheet" href="/fonts/kevin-sans.css" data-ll-fonts>`. Tests grep `dist/` to ensure `kevintngo.github.io` never appears in built assets.

## CSS isolation (iframes)

Looseleaf theme CSS redefines `:root` semantic tokens (~1,250 lines). Loading plain and Looseleaf CSS in one document would restyle both kits. This app uses a **Vite multi-page build** (`index.html`, `plain.html`, `sketch.html`) and embeds `plain.html` / `sketch.html` in same-origin iframes from the shell. Each entry imports only its kit CSS (`src/index.css` vs `src/looseleaf.css`).

## Radix base deviation

Repo demos usually use shadcn **Base UI** (`base-mira`). Here we use **`npx shadcn@4.22.1 init --base radix --preset mira`** so the plain side matches Looseleaf’s Radix primitives and props for a fair swap.

## Pinned npm packages (publish dates)

Verified with `npm view <pkg> time --json` before install (all ≥72h old at demo start):

| Package | Version | Published (UTC) |
|---------|---------|-----------------|
| react | 19.3.1 | 2026-10-31T09:15:40.031Z |
| react-dom | 19.3.1 | 2026-10-31T09:16:09.998Z |
| @types/react | 19.3.0 | 2026-09-09T18:08:49.750Z |
| @types/react-dom | 19.3.0 | 2026-09-09T18:07:51.886Z |
| vite | 8.3.5 | 2026-10-21T06:38:54.907Z |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05T10:08:27.143Z |
| typescript | 6.0.3 | (see npm) |
| tailwindcss | 4.3.3 | (see npm) |
| @tailwindcss/vite | 4.3.3 | (see npm) |
| @types/node | 24.19.2 | 2026-10-09T18:44:25.189Z |
| @types/bun | 1.4.4 | 2026-10-23T00:09:43.191Z |
| oxlint | 1.90.0 | 2026-10-27T05:51:39.684Z |
| shadcn (dev) | 4.22.1 | 2026-10-18T18:12:18.511Z |
| radix-ui | 1.8.1 | 2026-10-12T21:03:38.918Z |
| class-variance-authority | 0.7.1 | 2024-11-26T08:20:34.604Z |
| react-hook-form | 7.91.0 | 2026-10-23T21:37:28.462Z |
| sonner | 2.0.8 | 2026-08-09T08:46:10.174Z |
| @fontsource/ibm-plex-mono | 5.3.0 | 2026-07-19T03:39:57.977Z |
| tw-animate-css | 1.4.0 | 2025-09-24T05:25:53.055Z |
| @hugeicons/core-free-icons | 4.4.0 | 2026-10-28T19:51:17.096Z |
| @hugeicons/react | 1.1.10 | 2026-08-21T02:35:36.791Z |
| next-themes | 0.4.6 | 2025-03-11T21:02:05.882Z |
| @fontsource-variable/inter | 5.3.0 | 2026-07-19T03:50:25.793Z |
| cn | 0.5.0 | 2026-10-16T12:59:28.723Z |

Exact versions are pinned in `package.json` (no `^`/`~`). `bunfig.toml` sets `minimumReleaseAge = 259200`.

## Differences found

| Area | Plain shadcn | Looseleaf |
|------|----------------|-----------|
| Card root | Standard shadcn `Card` (`size?: sm \| default`) | Paper-based card (`stock`, `rules`, paper `size` tuple props) — screens use only shared subparts (`Header`, `Title`, …) |
| Form errors | Text `FormMessage` | Ink underline recipe on `FormMessage` |
| Dialog / buttons | Default mira chrome | Hand-drawn ink layers, `Paper` dialog surface |
| Toaster | shadcn sonner wrapper | Looseleaf sonner wrapper (may return null until mounted) |
| Extra props | — | Looseleaf components accept optional `seed` for ink variation (unused in this demo) |

## Licenses

| Component | License |
|-----------|---------|
| This demo app | MIT (monorepo) |
| Looseleaf (vendored) | MIT — `THIRD_PARTY_LICENSES/looseleaf-LICENSE.txt` |
| Kevin Sans (vendored woff2) | MIT (per Looseleaf README) |
| IBM Plex Mono (@fontsource) | SIL OFL 1.1 |
| Inter (@fontsource-variable) | SIL OFL 1.1 |
| shadcn/ui generated components | MIT |
| Other npm deps | See `package.json` (MIT/Apache-2.0 as published) |

## Mock / not verified

- All user names, stats, and settings are fictional; nothing is persisted server-side.
- Network panel offline check for fonts was verified via tests on built `dist/` (no `kevintngo.github.io` strings); live DevTools walkthrough is left to reviewers running `bun run dev`.
- Optional `data-density="compact"|"calm"` on Looseleaf is not exposed in the shell UI.
