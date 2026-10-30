# Dotty Agent Mascot

One-screen playground for [dotty-botty](https://www.npmjs.com/package/dotty-botty) 1.0.0 — a tiny procedural SVG mascot for AI agents and generative UI by [Roy Barber](https://dotty.roybarber.com).

The **agent console is simulated**: timed scripts, fake tool calls, and canned replies. No LLM, backend, or API keys.

## Run

```bash
cd apps/dotty-agent-mascot
bun install
bun run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

```bash
bun test    # script runner + Dotty smoke test
bun run build
```

## Pinned dependencies (publish dates verified 2026-10-30)

| Package | Version | Published (UTC) |
| --- | --- | --- |
| dotty-botty | 1.0.0 | 2026-10-27T10:48:06.655Z |
| react | 19.3.1 | 2026-10-14T16:47:15.290Z |
| react-dom | 19.3.1 | 2026-10-14T16:49:10.081Z |
| vite | 8.3.5 | 2026-10-21T06:38:54.907Z |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05T10:08:27.143Z |
| tailwindcss | 4.3.3 | 2026-07-16T12:03:35.267Z |
| @tailwindcss/vite | 4.3.3 | 2026-07-16T12:04:06.316Z |
| shadcn | 4.22.1 | 2026-10-18T18:12:18.511Z |
| lucide-react | 1.61.0 | 2026-10-21T06:12:38.158Z |

Install policy: `bunfig.toml` sets `[install] minimumReleaseAge = 259200` (72 hours).

## Simulated console → Dotty state

| Console phase | Dotty `state` |
| --- | --- |
| Typing in the prompt box | `listening` |
| After send (planning) | `thinking` |
| Tool log lines / streaming reply | `working` |
| Reply finished | `celebrating` |
| Failed scripted prompt | `alert` |
| ~20s idle | `sleeping` |
| Otherwise | `idle` |

Map a real agent the same way (e.g. AI SDK `useChat` status → `thinking` / `working` / `alert` / `idle`). See [dotty-botty README](https://github.com/roybarber/dotty-botty).

## Links

- Docs & demo: https://dotty.roybarber.com
- Source: https://github.com/roybarber/dotty-botty (MIT)
- Buzz: https://x.com/roybarberuk/status/2115056957933445564

Dotty is inspired by agent characters like xAI's Grok bot; this project is independent and not affiliated with xAI.
