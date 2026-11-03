# Reanimate Motion Diff Lab

Unofficial community demo. Not affiliated with Niaz Morshed or Reanimate. The real [Reanimate](https://github.com/NiazMorshed2007/reanimate) is a Claude Code skill that records real pages and videos; it does not run in this page.

Browser-only playground that walks through the **record → spec → build → verify → repeat** loop described in Reanimate’s docs, using bundled reference animations instead of Playwright captures.

## Run

```bash
cd apps/reanimate-motion-diff-lab
bun install
bun run dev
```

Other scripts: `bun test`, `bun run build`, `bun run lint`.

## Links

- Buzz: [Niaz Morshed on X (2026-10-30)](https://x.com/niazmorshed_/status/2116006291852423247)
- Reanimate repo (MIT): https://github.com/NiazMorshed2007/reanimate
- Site: https://reanimate.niazmorshed.dev/

## How the real skill works (summary)

1. **Record** — Film the reference in headless Chromium (fixed viewport/fps). Outputs frames, CSS/WAAPI metadata, and per-frame tracks.
2. **Spec** — Rows per element/property: start, duration, from→to, easing, stagger.
3. **Build** — Implement the copy in your stack (CSS, Framer Motion, GSAP, etc.).
4. **Verify** — Film the copy the same way; compare timing, easing, and optionally pixels.
5. **Repeat** — Fix the largest mismatch, re-record, usually 2–5 rounds; report residuals after 5 without relaxing thresholds.

Fidelity levels include **motion-faithful** (default) and **pixel-faithful** (mean frame mismatch ≤ 2%). See Reanimate’s `references/verify.md`.

## How this demo maps

| Skill step | This demo |
|---|---|
| Record | Bundled presets (`Card entrance`, `Toast slide`, `Badge pop`) — our own WAAPI keyframes, not scraped sites |
| Spec | Table of start, duration, from→to, easing for reference and copy |
| Build | Copy editor + “Copy CSS” (`@keyframes` + shorthand) |
| Verify | Paused `element.animate()` sampling at 30/60 fps; drift SVG curves; pass/fail rows |
| Repeat | **Next pass** nudges one parameter toward the reference; history + undo; stops at 5 passes |

**Simplifications:** no video/site capture, no pixel diff, no stagger/multi-element, no spring fitting (badge overshoot uses keyframes). Sampling uses a virtual scrubber; **Play live** runs both sides in real time (`prefers-reduced-motion` shortens live playback only).

**Honest shortcut:** **Next pass** reads bundled reference numbers. The real skill infers timing and easing from recordings.

## Match score (inspired by motion-faithful criteria)

Thresholds from Reanimate’s `references/verify.md` (motion-faithful):

- Start, end, duration error each ≤ **0.08 s**
- Easing: RMSE of reference curve applied to copy ≤ **0.05** (translateY track)
- Travel distance within **10%** per property

Overall **0–100** score (shown in UI):

```
overall = round(100 × (1 − weightedFailure))
weightedFailure = Σ(row.weight × failure) / Σ(row.weight)   // passing rows contribute 0
timing failure = max(|Δstart|, |Δend|, |Δduration|) / 0.08
easing failure = rmse / 0.05
travel failure = |Δtravel%| / 10
```

Label in UI: inspired by Reanimate’s motion-faithful criteria — **not** an official Reanimate score. No pixel diffing in this MVP.

## Pinned dependencies (72 h gate checked 2026-11-03)

| Package | Version | Published (UTC) |
|---|---|---|
| react / react-dom | 19.3.1 | 2026-10-14 |
| @types/react / @types/react-dom | 19.3.0 | 2026-09-09 |
| vite | 8.3.5 | 2026-10-21 |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 |
| typescript | 6.0.3 | 2026-04-16 (Apache-2.0) |
| tailwindcss / @tailwindcss/vite | 4.3.3 | 2026-07-16 |
| @types/bun | 1.4.4 | 2026-10-23 |
| @types/node | 24.19.2 | 2026-10-09 |
| oxlint | 1.90.0 | 2026-10-27 |
| shadcn (CLI) | 4.22.1 | 2026-10-18 |
| cn | 0.5.0 | 2026-10-16 |
| lucide-react | 1.61.0 | 2026-10-21 (ISC) |
| @base-ui/react | 1.9.0 | (via shadcn lock) |
| @hugeicons/react / core-free-icons | 1.1.10 / 4.3.5 | (via shadcn lock) |
| class-variance-authority | 0.7.1 | (via shadcn lock) |
| clsx | 2.1.1 | (via shadcn lock) |
| sonner | 2.0.8 | (via shadcn lock) |
| tailwind-merge | 3.7.0 | (via shadcn lock) |
| tw-animate-css | 1.4.0 | (via shadcn lock) |

Exact versions live in `package.json` / `bun.lock`. `[install] minimumReleaseAge = 259200` in `bunfig.toml`.

## Licenses

| Component | License |
|---|---|
| This demo’s original code | Same as parent repo |
| Reanimate (concept / criteria reference only; no code copied) | MIT © Niaz Morshed |
| React, Vite, Tailwind, shadcn/ui stack | MIT / Apache-2.0 / ISC as listed upstream |

## Not verified / mocked

- WAAPI sampling vs real Reanimate ffmpeg captures (should be close for transform/opacity, not byte-identical to skill output).
- Easing RMSE is a lightweight cubic-bezier fit, not a port of Reanimate’s `easing.ts`.
- Badge “overshoot” is keyframed, not a spring solver.
