# Kitesurf CDP Lab

Independent single-user lab for [Cloudflare Kitesurf](https://kitesurf.dev): replays **original** Chrome DevTools Protocol fixtures (navigate, DOM, console, screenshot) with zero network by default. Optional live mode opens a hand-written CDP WebSocket client against **your** local Kitesurf at `ws://127.0.0.1:8787`.

**This repository does not include, vendor, or build any Kitesurf source.** Fixtures and screenshots are authored for this lab only.

## Commands

```bash
cd apps/kitesurf-cdp-lab
bun install
bun run dev
bun test
bun run typecheck
bun run build
bun run preview
```

Production build (last run): JS **~90.1 kB gzip** (`dist/assets/index-*.js`).

## Architecture

| Area | Role |
|------|------|
| `src/fixtures/` | Lab page list, CDP transcripts, lab-generated screenshot PNG |
| `src/cdp/` | JSON-RPC framing, replay/scrub, DOM tree builder, console mapping, live WebSocket client |
| `src/features/cdp/` | React UI: load panel, agent step log, live toggle, explainer |

Default mode never opens external URLs. Live mode only attempts `ws://127.0.0.1:8787` when enabled.

## Optional: run Kitesurf locally

Follow the upstream project only on your machine — we do not bundle it:

- [github.com/cloudflare/kitesurf](https://github.com/cloudflare/kitesurf)
- [kitesurf.dev](https://kitesurf.dev)

Then enable **Live mode** in the lab UI.

## Credits & links

- [Kitesurf](https://kitesurf.dev) · [GitHub](https://github.com/cloudflare/kitesurf) · [Open-source blog](https://blog.cloudflare.com/kitesurf-open-source/) · [Launch post](https://x.com/celso/status/2120994509551223020)

Apache-2.0 applies to **Kitesurf upstream**, not this demo app (private lab in `cool-tech`).