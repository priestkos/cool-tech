# CopilotKit Generative UI Catalog

One-page demo for CopilotKit **Generative UI: Catalog and Surfaces** (`@copilotkit/react-core@1.83.0`, markdown transport, A2UI v1.0). Browse all **69** standard components (runtime count from `standardUI.manifestComponents`; the launch post mentions “70”), chat with a **mock** scripted agent or optional **real** OpenAI-backed AG-UI mode, and render into a page **Pinned** surface.

Status: **Experimental** · **A2UI 1.0 (candidate)** per upstream JSDoc and docs.

## Run

```bash
cd apps/copilotkit-genui-catalog
bun install
bun run dev
```

Open the Vite URL (default `http://localhost:5173`). `bun run dev` starts Vite and a local AG-UI server on `127.0.0.1:8787` (proxied at `/api/*`).

Without API keys, use **MOCK** mode (default): no outbound model calls; replies are scripted ```a2ui fences with real CopilotKit rendering.

### Real mode (optional)

Create `.env.local` from `.env.example`:

- `OPENAI_API_KEY` — never exposed to the browser
- `OPENAI_MODEL` — required when the key is set
- `OPENAI_BASE_URL` — optional, defaults to `https://api.openai.com/v1`

Restart `bun run dev`, toggle **REAL** in the header when `/api/status` reports `realModeAvailable: true`. Each run sends ~55 KB of catalog context (markdown guide + component schemas). Real mode was implemented but **not exercised** in CI for this PR (no key in the cloud agent environment).

## What is real vs scripted

| Area | Mock (default) | Real |
|------|----------------|------|
| Catalog previews | CopilotKit `standardUI` | Same |
| Chat UI | CopilotKit `CopilotChat` | Same |
| Agent | Client `MockCatalogAgent` | `HttpAgent` → `POST /api/agent` |
| Reply text | Intent matcher + fixed fences | Model output (should include ```a2ui) |

Mock chat shows a header badge: **Mock agent: scripted replies, no model**.

## Package pins (publish dates, UTC)

Verified with `npm view <pkg> time --json` before install (`bunfig.toml` `minimumReleaseAge = 259200`).

| Package | Version | Published |
|---------|---------|-----------|
| `@copilotkit/react-core` | 1.83.0 | 2026-10-28T10:24:45Z |
| `@ag-ui/client` | 1.0.2 | 2026-10-05T14:21:02Z |
| `@ag-ui/core` | 1.0.2 | 2026-10-05T14:23:35Z |
| `@ag-ui/encoder` | 1.0.2 | 2026-10-05T14:27:08Z |
| `rxjs` | 7.8.1 | (stable) |
| `zod` | 4.6.7 | 2026-10-12T16:29:37Z |
| `react` / `react-dom` | 19.3.1 | 2026-10-14T16:47:15Z |
| `vite` | 8.3.5 | 2026-10-21T06:38:54Z |
| `@vitejs/plugin-react` | 6.1.2 | 2026-10-05T10:08:27Z |
| `tailwindcss` / `@tailwindcss/vite` | 4.3.3 | 2026-07-16T12:03:35Z |
| `lucide-react` | 1.61.0 | 2026-10-21T06:12:38Z |
| `shadcn` | 4.22.1 | 2026-10-18T18:12:00Z |
| `@types/bun` | 1.4.4 | 2026-10-23T00:09:43Z |
| `concurrently` | 10.0.6 | 2026-10-08T12:53:46Z |

Lockfile resolves only `@copilotkit/*@1.83.0` for CopilotKit packages. **`@copilotkit/runtime` is intentionally omitted** (channels deps failed the 3-day age rule at build time; not needed for markdown transport + mock agent).

### Map / maplibre

`Map` uses CopilotKit’s place-list fallback when `maplibre-gl` is not installed (optional peer `^5.0.0`; current major is 6). This demo does not install MapLibre.

## Docs and links

- [Generative UI components](https://docs.copilotkit.ai/generative-ui/components)
- [Surfaces](https://docs.copilotkit.ai/generative-ui/components/surfaces)
- [CopilotKit @ v1.83.0](https://github.com/CopilotKit/CopilotKit/tree/v1.83.0)
- [Launch post](https://x.com/CopilotKit/status/2115499466182799400)

## Tests

```bash
bun test
```

Covers mock intent mapping, AG-UI event sequence shape, and validation of scripted fence component props against `standardUI` schemas.

## Licenses

CopilotKit is MIT — see `THIRD_PARTY_LICENSES/copilotkit-LICENSE.txt`.

| Package | License |
|---------|---------|
| `@copilotkit/react-core` | MIT |
| `@ag-ui/client`, `@ag-ui/core`, `@ag-ui/encoder` | MIT |
| `react`, `react-dom` | MIT |
| `vite`, `@vitejs/plugin-react` | MIT |
| `tailwindcss`, `@tailwindcss/vite` | MIT |
| `rxjs` | Apache-2.0 |
| `zod` | MIT |
| `lucide-react` | ISC |
| `shadcn` CLI | MIT |
| `next-themes` | MIT |
| `concurrently` | MIT |
