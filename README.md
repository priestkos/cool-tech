# cool-tech

A daily tech-demo playground. Each pick is one small, self-contained app in `apps/<slug>/`.

Live at **https://priestkos-cool-tech.pages.dev/** — one path per app, no paid backend or model enabled.

## Layout

- `AGENTS.md` — rules for agents working in this repo
- `skills/project-planning/` — opinionated Bun/shadcn planning skill
- `apps/` — one demo per kebab-slug
- `scripts/build-site.sh` — build every app into one static tree for Cloudflare Pages
- `scripts/make-index.mjs` — writes the site index and the "not yet deployed" list
- `tracking/<slug>.json` — current pin and build mode for that demo
- `tracking/seen-bookmarks.json` — rollup of proposed, built, and skipped picks

## Run a demo

Each app is its own Bun project:

```bash
cd apps/<slug>
bun install
bun run dev
```

`bun install` reads that app’s `bunfig.toml`, which sets `[install] minimumReleaseAge = 259200`. A release younger than 72 hours will not install. Commands, pins, and limits for one lab live in `apps/<slug>/README.md`.

Each app also typechecks, builds and tests on its own:

```bash
cd apps/<slug>
bun run typecheck   # where the app defines it
bun run build
bun test
```

Some labs need more than the dev server:

| App | Constraint |
|---|---|
| `apps/eve-agent-lab/` | Node.js 24+ for the eve dev process. Bun still installs packages and runs scripts. Default mode uses `mockModel` and no API key. |
| `apps/reverb-voice-lab/` | WebGPU browser (recent Chrome, Edge, or Safari 26+). Weights are CC BY-NC 4.0. |
| `apps/screen-relay-console/` | Node ≥22 for `screen-relay@0.1.0`. Mock PNG frames are the default. Live mode attaches to a local engine at `http://127.0.0.1:8080` after `npx screen-relay@0.1.0 install` and `screen-relay up -d`. |
| `apps/polyfork-kit-lab/` | Offline catalog snapshot by default. Live mode is the only path that loads `.mjs` modules from `polyfork.dev`, and those modules are not committed. |

## Deploy

One Cloudflare Pages project, one path per app. Every app is built with `--base=/apps/<slug>/` so its assets resolve under the deployed path.

```bash
scripts/build-site.sh                 # -> site-dist/ (apps/<slug>/ + index.html)
npx wrangler pages deploy site-dist --project-name cool-tech
```

`scripts/build-site.sh` installs and builds every app, copies each `dist/` into `site-dist/apps/<slug>/`, and records a per-app log in `../site-build-logs/` so a broken app fails visibly instead of shipping a blank page. `scripts/make-index.mjs` then writes the index from each app's own `<title>`.

Apps that call a server API this site does not host are listed under "Not yet deployed" on the index instead of being published half-working. That list lives in `scripts/make-index.mjs` — move an entry out of `PENDING` once its static build can stand alone.

## Provenance

`tracking/<slug>.json` is the current pin and build mode. `tracking/seen-bookmarks.json` should match that file and the app README after a remake. The table below is the exception list: every other demo uses real upstream code at a pin at least three days old.

## Clean-room and inspired builds

The demos below do not include the project's original code. A demo that does ship upstream source stays out of this table and records its pin in `tracking/<slug>.json` instead.

| App | Build type | Upstream | Status |
|---|---|---|---|
| `apps/agent-desktop-tree-lab/` | inspired-fixture-only | https://github.com/vercel-labs/agent-desktop | kept: Native Rust/OS computer-use CLI; there is no browser package to drop into Vite. |
| `apps/anatomy-machine-lab/` | inspired-fixture-only | https://github.com/wheresryan22/anatomy | kept: It is an agent skill, not a browser library; the official generator cannot run inside a no-key Vite app. |
| `apps/benchup-board-lab/` | clean-room-recreation | https://github.com/BenchUp3D/benchup | kept: The official app is a Rust/WASM/WebGPU workspace, not an npm component; a remake can host or embed the official v0.7.2 browser dist rather than wrap it as a shadcn widget. |
| `apps/design-agent-brief-studio/` | inspired-fixture-only | https://github.com/langchain-ai/design-agent | kept: The actual product is a hosted/agent pipeline with model credentials, not a Bun+Vite library. |
| `apps/gradient-playground/` | clean-room | https://gradients.sh | kept: the demo ships its own shader engine under `src/lib/gradient-engine/` and only reproduces the public `npx shadcn add` command; no gradients.sh component source is copied. |
| `apps/kitesurf-cdp-lab/` | clean-room | https://github.com/cloudflare/kitesurf | kept: Kitesurf is a Workers/WASM browser engine built with Bazel and wrangler, not a library you import in a Vite app. A faithful remake cannot live inside apps/kitesurf-cdp-lab alone. |
| `apps/opencrawl-board-lab/` | clean-room | https://github.com/getopencrawl/opencrawl-core | kept: The official product is a Docker/MCP server and console, not a package you pin into a Bun+Vite+shadcn app. |
| `apps/polyfork-kit-lab/` | hybrid | https://polyfork.dev | hybrid: bundles the public catalog snapshot (`polyfork-catalog`, CC BY 4.0 data) and leaves `.mjs` modules on the official CDN; the offline parametric preview is a local stand-in, not Polyfork source. |
| `apps/reanimate-motion-diff-lab/` | inspired-recreation | https://github.com/NiazMorshed2007/reanimate | kept: It is a Claude Code skill with Playwright recording, not a library that runs inside a Vite page. |
| `apps/screenshot-to-tokens-lab/` | inspired-fixture-only | https://github.com/nhunsaker/screenshot-to-tokens | kept: Faithful use of the official pipeline needs model/segmentation APIs and is not a no-key Bun+Vite integration. |
| `apps/security-audit-explorer/` | hybrid | https://github.com/cloudflare/security-audit-skill | hybrid: the report schema and dependency-free validators are vendored at commit `c1c8a8c`; the explorer UI, triage state and example runs are local. |
| `apps/selfgraph-lab/` | hybrid | https://github.com/hydra-db/selfgraph | hybrid: tests use the real package, browser store is clean-room |
| `apps/stack-diagram-studio/` | recreation | https://github.com/caru-ini/stack-diagram | kept: The actual product is an agent skill plus Python logo fetch, not a Vite-installable library; running it faithfully needs an agent and network. |
| `apps/vybbench-lab/` | inspired-fixture-only | https://github.com/cocolabsai/vybbench | kept: The official scorer is Python plus a HuggingFace dataset, not something to import in Vite. The current lab already uses published scores; swapping mock SVGs for official dataset stills would be a data fix, not a code remake. |

## Not yet deployed

Eleven apps build as static pages but cannot run on this static host yet; each one and its reason is listed on the [live index](https://priestkos-cool-tech.pages.dev/#not-yet-deployed). They split into apps that need a Workers function (`openui-agent-ui`, `copilotkit-genui-catalog`, `web-fetch-lab`) and apps that need a real process at runtime (`bun-fmt-playground`, `hyperframes-studio-lite`, `open-code-review-playground`, `sandbox-runtime-playground`, `hyper-elements-studio`, `screen-relay-console`, `sprite-stack-studio`, `eve-agent-lab`). No paid backend is enabled for any of them.
