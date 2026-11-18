# cool-tech

A daily tech-demo playground. Each pick is one small, self-contained app in `apps/<slug>/`.

## Layout

- `AGENTS.md` — rules for agents working in this repo
- `skills/project-planning/` — opinionated Bun/shadcn planning skill
- `apps/` — one demo per kebab-slug
- `tracking/seen-bookmarks.json` — proposed, built, and skipped picks

## Clean-room and inspired builds

Demos use the real upstream code pinned to versions at least 3 days old unless they are listed here. The demos below do not include the project's original code.

| App | Build type | Upstream | Status |
|---|---|---|---|
| `apps/agent-desktop-tree-lab/` | inspired-fixture-only | https://github.com/vercel-labs/agent-desktop | kept: Native Rust/OS computer-use CLI; there is no browser package to drop into Vite. |
| `apps/agent-swarm-lab/` | clean-room | https://github.com/zadescoxp/agent-swarm-effect | remake with real code in progress (Nov 18) |
| `apps/anatomy-machine-lab/` | inspired-fixture-only | https://github.com/wheresryan22/anatomy | kept: It is an agent skill, not a browser library; the official generator cannot run inside a no-key Vite app. |
| `apps/benchup-board-lab/` | clean-room-recreation | https://github.com/BenchUp3D/benchup | kept: The official app is a Rust/WASM/WebGPU workspace, not an npm component; a remake can host or embed the official v0.7.2 browser dist rather than wrap it as a shadcn widget. |
| `apps/bobine-media-lab/` | clean-room | https://github.com/SanyamPunia/bobine | remake with real code in progress (Nov 18) |
| `apps/bottle-studio-lab/` | recreation | https://github.com/amirmushichge/bottle-studio | remake with real code in progress (Nov 18) |
| `apps/design-agent-brief-studio/` | inspired-fixture-only | https://github.com/langchain-ai/design-agent | kept: The actual product is a hosted/agent pipeline with model credentials, not a Bun+Vite library. |
| `apps/ding-toast-lab/` | inspired-fixture-only | https://github.com/YusufCeng1z/ding | remake with real code in progress (Nov 18) |
| `apps/kitesurf-cdp-lab/` | clean-room | https://github.com/cloudflare/kitesurf | kept: Kitesurf is a Workers/WASM browser engine built with Bazel and wrangler, not a library you import in a Vite app. A faithful remake cannot live inside apps/kitesurf-cdp-lab alone. |
| `apps/opencrawl-board-lab/` | clean-room | https://github.com/getopencrawl/opencrawl-core | kept: The official product is a Docker/MCP server and console, not a package you pin into a Bun+Vite+shadcn app. |
| `apps/reanimate-motion-diff-lab/` | inspired-recreation | https://github.com/NiazMorshed2007/reanimate | kept: It is a Claude Code skill with Playwright recording, not a library that runs inside a Vite page. |
| `apps/screenshot-to-tokens-lab/` | inspired-fixture-only | https://github.com/nhunsaker/screenshot-to-tokens | kept: Faithful use of the official pipeline needs model/segmentation APIs and is not a no-key Bun+Vite integration. |
| `apps/selfgraph-lab/` | hybrid | https://github.com/hydra-db/selfgraph | hybrid: tests use the real package, browser store is clean-room |
| `apps/stack-diagram-studio/` | recreation | https://github.com/caru-ini/stack-diagram | kept: The actual product is an agent skill plus Python logo fetch, not a Vite-installable library; running it faithfully needs an agent and network. |
| `apps/stageshow-moments/` | inspired-recreation | https://github.com/benjitaylor/skills/tree/main/stageshow | remake with real code in progress (Nov 18) |
| `apps/threert-scene-lab/` | clean-room | https://github.com/meshy-dev/ThreeRT | remake with real code in progress (Nov 18) |
| `apps/ui-sdk-behavior-lab/` | clean-room | https://github.com/vercel-labs/ui | remake with real code in progress (Nov 18) |
| `apps/vybbench-lab/` | inspired-fixture-only | https://github.com/cocolabsai/vybbench | kept: The official scorer is Python plus a HuggingFace dataset, not something to import in Vite. The current lab already uses published scores; swapping mock SVGs for official dataset stills would be a data fix, not a code remake. |
