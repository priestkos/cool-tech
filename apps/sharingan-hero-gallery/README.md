# Sharingan Hero Gallery

Daily demo for [Sharingan](https://github.com/rasengan-dev/sharingan) — animated landing-page heroes (WebGPU + DOM) installed through the shadcn registry.

Source buzz: [@DilaneKombou on X (Oct 25 2026)](https://x.com/DilaneKombou/status/2114333976978751849).

## Run

```bash
cd apps/sharingan-hero-gallery
bun install
bun run dev
```

Then open the printed local URL. No network calls at runtime; heroes are committed after install.

## Heroes installed

Five registry items from Sharingan commit **`567bc1ab5f6a68d0923fb29219928eb0cc1c0208`** (2026-10-25T14:01:55+01:00):

| Hero | Engine |
|------|--------|
| aurora-mesh | WebGPU |
| ink-flow | WebGPU |
| split-headline | DOM |
| holo-card | DOM |
| beam-grid | DOM |

### Install path (registry build + pinned shadcn)

1. Clone Sharingan **outside** this repo, checkout `567bc1ab`, run `SHARINGAN_URL=http://localhost:3100 node scripts/registry.mjs`.
2. Serve `/tmp/sharingan/apps/site/public` on `127.0.0.1:3100`.
3. In this app: `bunx shadcn@4.22.1 add http://127.0.0.1:3100/r/{aurora-mesh,ink-flow,split-headline,holo-card,beam-grid}.json --yes`.

We did **not** use the hosted `sharingan.hiraiship.app` registry (unversioned main).

## Pinned versions (3-day rule checked 2026-10-28 UTC)

| Package | Version | Published (UTC) |
|---------|---------|-----------------|
| Sharingan (git) | `567bc1ab5f6a68d0923fb29219928eb0cc1c0208` | 2026-10-25T13:01:55Z (commit) |
| create-vite | 9.3.1 | 2026-10-20T03:02:49Z |
| shadcn | 4.22.1 | 2026-10-18T18:12:18Z |
| typegpu | 0.12.8 | 2026-10-16T18:35:31Z |
| zod | 4.6.7 | 2026-10-12T16:29:37Z |
| react / react-dom | 19.3.1 | 2026-10-14T16:47–49Z |
| vite | 8.3.5 | 2026-10-21T06:38:54Z |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05T10:08:27Z |
| tailwindcss / @tailwindcss/vite | 4.3.3 | 2026-07-16T12:03–04Z |
| @webgpu/types | 0.1.74 | 2026-09-19T02:29:39Z |

`bunfig.toml` sets `[install] minimumReleaseAge = 259200` (72 hours).

## WebGPU fallback behavior

WebGPU heroes (`aurora-mesh`, `ink-flow`) paint a CSS gradient before WebGPU starts and **instead of** the shader when WebGPU is unavailable (`mountScene` → `onFallback`: `unsupported`, `no-adapter`, `error`, etc.). The gallery shows a status pill and a **Force fallback** switch (CSS layer only).

On machines without `navigator.gpu`, recordings will show **CSS fallback** — not live shaders. DOM heroes animate without WebGPU.

## Tests

```bash
bun test
```

Covers the schema→control mapper and JSX string generator.

## Licenses

| Component | License |
|-----------|---------|
| This demo app | Same as monorepo |
| Sharingan heroes + `lib/sharingan` | MIT — see `THIRD_PARTY_LICENSES/sharingan-LICENSE.txt` (Copyright (c) 2026 Dilane Kombou) |
| React, Vite, Tailwind, shadcn/ui, typegpu, zod, etc. | Per upstream (MIT / Apache-2.0 as applicable on npm) |

Sharingan site fonts (Geist), posters, and Unsplash assets were **not** copied.
