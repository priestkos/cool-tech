# OpenUI Agent UI — PLAN

**Goal:** A small single-user chat where the agent answers with rendered UI (cards, tables, forms, charts) instead of plain text, built on OpenUI 1.0.

Source buzz: https://x.com/DataChaz/status/2111434406783279520 (OpenUI 1.0, @openuidev). Find the official repo and docs yourself (search GitHub / npm for OpenUI by openuidev); use only the official package and its documented APIs, and link them in the README.

## Single-user MVP
1. Chat screen (shadcn) with a message list and composer.
2. Agent replies render as OpenUI UI components (e.g., a weather/info card, a comparison table, a small form, a list with actions), using OpenUI's official rendering approach.
3. Mock mode (DEFAULT, no API key needed): a built-in scripted responder that maps a few suggested prompts (and a fallback) to pre-written OpenUI responses, streamed/displayed the same way a real model response would be.
4. Optional real mode: if a key is set in `.env` (e.g., `OPENAI_API_KEY` or whatever provider OpenUI's docs use), the app calls the real model through OpenUI's documented integration. Ship `.env.example` only; `.env` must be gitignored. Mode badge in the header shows Mock vs Live.
5. Suggested-prompt chips so the demo works in one click.

**Out of scope:** auth, persistence across sessions beyond optional localStorage, multi-user, tool-calling beyond what OpenUI examples provide, deploy.

## Tasks (vertical slices)
1. Read the official OpenUI repo/docs; choose the scaffold the docs recommend (if none, Vite + React + TS via `bunx create-vite@latest . --template react-ts`, or Next.js via `bunx create-next-app@latest` if a server route is needed for the live key). Skip install, add bunfig.toml, `bun install`, shadcn init (minimalist preset).
2. Chat UI with shadcn components.
3. Mock responder producing OpenUI-format responses for 3-5 scripted prompts + fallback; render them.
4. Live mode wired via `.env` per OpenUI docs, server-side only so the key never reaches the browser bundle.
5. README (mock default, how to enable live mode, links to official OpenUI repo/docs), screenshot + video (in mock mode), PR.

## Stack
- Scaffold per OpenUI docs (fallback Vite React TS / Next.js if a server route is required): least wiring.
- OpenUI official package: the tech being demoed.
- shadcn/ui minimalist preset: repo standard.

## Deferred
- Conversation history persistence, multiple providers, deploy preview, tests beyond one test for the mock responder mapping.
