# OpenUI Agent UI

Single-user chat demo for [OpenUI 1.0](https://www.openui.com/docs/getting-started): the assistant replies with **OpenUI Lang** that renders as cards, tables, forms, and lists—not plain markdown.

- Official repo: [thesysdev/openui](https://github.com/thesysdev/openui)
- Docs: [openui.com/docs](https://www.openui.com/docs/getting-started)
- UI generation setup: [Set up UI generation](https://www.openui.com/docs/build-agents/ui-generation)

## Run locally

```bash
cd apps/openui-agent-ui
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). **Mock mode is the default** (no API key). Use the suggested prompt chips or type a message.

## Mock vs Live

| Mode | Badge | Requirements |
|------|-------|----------------|
| **Mock** (default) | `Mock` | None — scripted OpenUI Lang responses streamed like a real model |
| **Live** | `Live` | `THESYS_API_KEY` in `.env` (OpenUI Gateway, server-side only) |

Copy `.env.example` to `.env` and set your key:

```bash
cp .env.example .env
# bunx @openuidev/cli@latest generate-api-key
```

Restart the dev server after changing `.env`.

## Stack

- [Next.js](https://nextjs.org/) (App Router) for the chat API route
- [@openuidev/react-lang](https://www.npmjs.com/package/@openuidev/react-lang) `Renderer` + [@openuidev/react-ui](https://www.npmjs.com/package/@openuidev/react-ui) `openuiChatLibrary`
- [shadcn/ui](https://ui.shadcn.com/) (mira preset) for the chat chrome

## Scripts

- `bun run dev` — development server
- `bun run build` — production build (regenerates `src/lib/openui.spec.json` first)
- `bun test` — mock responder mapping tests

## Suggested prompts (mock)

- What's the weather in San Francisco?
- Compare React and Vue
- Show me a signup form
- Compare cloud providers in a table
