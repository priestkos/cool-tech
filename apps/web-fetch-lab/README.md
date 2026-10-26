# Web Fetch Lab

A single-screen lab for [`@ai-sdk/tool-web-fetch`](https://github.com/vercel/ai/tree/main/packages/tool-web-fetch) (AI SDK Web Fetch Tool). Paste a URL to compare **raw HTML** with the **Markdown** the model receives, tune safety switches, and run a mock agent that demonstrates prompt-injection exfiltration vs blocking.

- Source buzz: [@aisdk on X](https://x.com/aisdk/status/2113669323483128111)
- Docs: [AI SDK Web Fetch tool](https://ai-sdk.dev/docs/ai-sdk-core/tools#web-fetch-tool)

## Run locally

```bash
cd apps/web-fetch-lab
bun install
bun run dev
```

Open the Vite URL printed in the terminal (default port 5173). No API key is required; the chat panel uses `MockLanguageModelV4` from `ai/test`.

Optional: copy `.env.example` to `.env` and set `OPENAI_API_KEY` to enable the **Real model** toggle.

## Architecture

- **Bun.serve** (`server/index.ts`) runs the web fetch tool server-side (`POST /api/fetch`, `POST /api/chat`, `GET /api/fixtures/injection`).
- **Vite** proxies `/api` to the Bun server (`scripts/dev.ts` starts both).

## Prompt-injection fixture transport

The bundled injection page uses hostname `fixture.web-fetch-lab.example`. The default tool transport blocks localhost/private networks, so we **cannot** serve this fixture from a local Bun HTTP port and fetch it through the stock transport.

Instead, when **Fixture transport** is enabled (automatically for the injection preset), the server passes a custom `fetch` that:

1. Returns the bundled HTML for `fixture.web-fetch-lab.example` in-process.
2. Simulates `attacker.example` responses in-process so the demo can show a “leak” without sending bytes anywhere.

Real public URLs still use the validated default download transport (DNS pinning and private-address checks intact).

## Pinned versions

- `@ai-sdk/tool-web-fetch@1.0.0`
- `ai@7.0.150`
- `@ai-sdk/provider-utils@5.0.67`

`bunfig.toml` sets `minimumReleaseAge = 259200` (72 hours).
