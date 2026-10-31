# CopilotKit Generative UI Catalog — PLAN

**Goal:** A one-page app to browse CopilotKit's standard Generative UI catalog live, and to chat with a mock agent whose replies are real catalog components streamed into the chat and into a page surface.

Source buzz: https://x.com/CopilotKit/status/2115499466182799400 (@CopilotKit, Oct 28 2026). Official: https://docs.copilotkit.ai/generative-ui/components and https://github.com/CopilotKit/CopilotKit @ v1.83.0 (MIT). Feature status: Experimental, A2UI 1.0 (candidate).

## Single-user MVP
1. Header: links to the docs, repo and X post; an "Experimental · A2UI 1.0 (candidate)" tag; a MOCK / REAL badge with one line explaining the mode; and a light/dark theme toggle that the generated components follow.
2. Catalog browser: the full standard catalog, counted from the package (69 in 1.83.0), with search and group filters (Layout, Text, Inputs, Data, Media, Feedback and overlay, Composites). Selecting a component shows a live preview rendered by CopilotKit from a sample A2UI fence, and its props schema (name, type, required, enum values) from the package.
3. Chat: CopilotKit's v2 `CopilotChat` with markdown transport and a client-side mock agent. Five suggestion chips stream scripted replies that use real components: a signup form with validation, a table, a chart, a pricing card with a bound slider, and a "pin to page" reply.
4. Page surface: a "Pinned" panel (`GenerativeUISurface id="pinned"`) that a chat reply fills or updates through a targeted fence, to show surfaces outside the chat.
5. Optional real mode: when the server has `OPENAI_API_KEY` and `OPENAI_MODEL`, a toggle switches the chat to an AG-UI endpoint that sends the catalog context to the model.

**Out of scope:** `@copilotkit/runtime` and the tool transport, custom catalogs beyond a tiny `extends` example, app-state functions beyond one bound value, MCP apps, the Inspector, persistence, auth, deploy.

## Tasks (vertical slices)
1. Check the start time and that every pinned package is at least 3 days old. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Provider and mock agent: CopilotKitProvider with `standardUI` in markdown mode, `CopilotChat`, and a MockAgent that streams one scripted reply. One real component renders in chat.
3. Catalog browser: list, search and group filter from the package, a live preview per component, and the props schema panel.
4. Scripted intents and suggestion chips, the Pinned surface filled by a targeted fence, the theme toggle, and honest mode labels.
5. Optional real mode: the Bun AG-UI endpoint, /api/status and the mode toggle, or a documented deferral.
6. Tests (fence and prop validation, intent matcher, event sequence), README (pins with dates, real vs scripted, status caveats, license table), screenshot and video, PR.

## Stack
- `@copilotkit/react-core` 1.83.0 (`/v2` and `/v2/generative-ui`): the tech being demoed, pinned past the 3-day rule.
- `@ag-ui/client` 1.0.2 (`AbstractAgent`, `HttpAgent`): the AG-UI agent interface CopilotKit talks to, for the scripted mock agent and the optional real endpoint.
- Markdown transport: works with a client-side agent and no `@copilotkit/runtime`, so mock mode needs no server.
- Bun.serve (real mode only): the smallest server that keeps the key off the client.
- Vite + React + TS: least wiring for a client-first page.
- shadcn/ui minimalist preset (input, badge, tabs or toggle-group, scroll-area, card, switch, button): repo standard for the app shell only.

## Deferred
- Tool transport through `@copilotkit/runtime`: its 1.83.0 deps are too new until Oct 31 19:08 IST, and it adds a heavy server for no visible gain in a mock demo.
- Custom catalog authoring (`createGenerativeUI` with your own components and `overrides`): a good follow-up once the standard catalog is clear.
- Theme editor for the generative UI theme variables: the light/dark toggle shows theming already.
- Deploy preview: optional per AGENTS.md; mock mode could deploy as static files later.
