# Stageshow Moments

Unofficial demo built by following [Benji Taylor](https://benji.org/)’s [Stageshow](https://benji.org/stageshow) skill. **Not made by or affiliated with Benji Taylor, and not the Stageshow kit.** All brands shown are fictional.

Source buzz: [X post](https://x.com/benjitaylor/status/2116593247854453244) · Skill repo: [benjitaylor/skills/stageshow](https://github.com/benjitaylor/skills/tree/main/stageshow) · Reference commit: [`802057409787133703c56001080169e347305572`](https://github.com/benjitaylor/skills/commit/802057409787133703c56001080169e347305572) (2026-10-31T11:07:17-07:00). Read at that pin; the repo may have newer commits on `main`.

Design guidance followed from Stageshow (MIT). **No Stageshow code, kit, examples, or assets are included** — only ideas and documented numbers (see `THIRD_PARTY_LICENSES/stageshow-LICENSE.txt`).

## Run

```bash
cd apps/stageshow-moments
bun install
bun run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

```bash
bun test    # timeline, registry, reduced-motion
bun run build
```

## Bento tile table

| Tile | Span | Kind | The one thing | Words |
| --- | --- | --- | --- | --- |
| Wavelet | 2 × 1 | Hero UI | Cursor presses play; track moves to Playing | “Press play” + one sentence |
| Dayline | 1 × 1 | Component | Accept invite; event fills its slot | “Accept invite” + one sentence |
| Tallypay | 1 × 1 | Component | Pay resolves; receipt satellite appears | “Pay & receipt” + one sentence |
| Natter | 1 × 1 | Component | Reply lands with Delivered + reaction | “Reply lands” + one sentence |
| Checkout speed | 1 × 1 | Stat | Fictional “2.1 s median checkout” | “Up to” + number + label |

### Moment stories

1. **Wavelet (hero)** — Paused track → play cursor → pause control, progress, lit “Playing” row. Poster: landed After.
2. **Dayline** — Invite card → Accept press → “Accepted” + accent slot fill.
3. **Tallypay** — Pay button → check/Paid, amount settles, receipt straddles tile edge. Neutral initial card tile only.
4. **Natter** — Typing → outbound “On my way” with Delivered and 👍.
5. **Stat** — Calm number tile; no motion loop.

## Checked against Stageshow

Self-review from `references/verify.md` / `review.md` at pin `8020574`:

| Moment | Real strings (3–7) | Poster | Crop / gutter | Motion cause | Compact |
| --- | --- | --- | --- | --- | --- |
| Wavelet | 5 | After (playing) | Hero window chrome once; art cropped in tile | Cursor only on hero; click → play | Scaled stage ≤358px column |
| Dayline | 5 | After (accepted) | Week + invite; left gutter | Accept press → slot fill | Same |
| Tallypay | 5 | After (paid + receipt) | Receipt bleeds tile edge | Pay press → Paid + receipt | Same |
| Natter | 5 | After (reply landed) | Thread crop, no void | Typing → bubble land | Same |
| Stat | 3 | After (n/a) | Number + unit nowrap | Static | Reflow only |

**Knowingly omitted:** Stageshow kit (`Stage`, `Act`, `film.mjs`), dark theme, sixth moment, Playwright filming, real brands/fonts/photos.

## Pinned dependencies (verified ≥72h before install, 2026-11-01)

| Package | Version | Published (UTC) | License |
| --- | --- | --- | --- |
| shadcn | 4.22.1 | 2026-10-18T18:12:18Z | MIT |
| react | 19.3.1 | 2026-10-14T16:47:15Z | MIT |
| react-dom | 19.3.1 | 2026-10-14T16:49:10Z | MIT |
| @types/react | 19.3.0 | 2026-09-09T18:08:49Z | MIT |
| @types/react-dom | 19.3.0 | 2026-09-09T18:08:49Z | MIT |
| vite | 8.3.5 | 2026-10-21T06:38:54Z | MIT |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05T10:08:27Z | MIT |
| typescript | 6.0.3 | 2026-04-16T23:38:27Z | Apache-2.0 |
| tailwindcss | 4.3.3 | 2026-07-16T12:03:35Z | MIT |
| @tailwindcss/vite | 4.3.3 | 2026-07-16T12:04:06Z | MIT |
| lucide-react | 1.61.0 | 2026-10-21T06:12:38Z | ISC |
| @types/bun | 1.4.4 | 2026-10-23T00:09:43Z | MIT |
| @base-ui/react | 1.9.0 | (shadcn peer) | MIT |
| class-variance-authority | 0.7.1 | (shadcn) | Apache-2.0 |
| cn | 0.5.0 | (shadcn) | MIT |
| tw-animate-css | 1.4.0 | (shadcn) | MIT |
| @hugeicons/react | 1.1.10 | (shadcn icons) | MIT |
| oxlint | 1.88.0 | dev | MIT |
| happy-dom | 21.0.4 | dev | MIT |

`bunfig.toml` sets `[install] minimumReleaseAge = 259200` (no excludes).

## Motion note

Travel uses `cubic-bezier(0.45, 0, 0.1, 1)`; arrivals use `cubic-bezier(0.25, 0.8, 0.25, 1)` (~0.8–1s), per Stageshow’s documented curves — implemented in our CSS/timeline only.
