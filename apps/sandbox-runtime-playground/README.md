# Sandbox Runtime Playground

One-screen demo of [Anthropic sandbox-runtime](https://github.com/anthropics/sandbox-runtime) (`srt`, npm `@anthropic-ai/sandbox-runtime`, Apache-2.0): pick filesystem and network policy, watch `srt-settings.json` update live, and run preset agent commands to see what is allowed or blocked.

Buzz: [RoundtableSpace on X](https://x.com/RoundtableSpace/status/2114699842601558046)

## Run locally

```bash
cd apps/sandbox-runtime-playground
bun install
bun run dev
```

Open the Vite URL (default `http://localhost:5173`). The Bun API listens on `3922` (override with `SRT_PLAYGROUND_API_PORT`).

**Mock (simulated) mode** is the default and works with no extra system packages. It applies the same allow/deny precedence as srt (allow-only network, read deny-then-allow, write allow-only with `denyWrite` winning).

**Real mode** uses `@anthropic-ai/sandbox-runtime` on the host. The UI toggle is enabled only when `GET /api/status` reports dependencies are present and a CLI smoke test succeeds. Preset commands are fixed on the server; there is no free-form shell from the browser.

### Real mode per OS

| OS | Requirements |
| --- | --- |
| **macOS** | `sandbox-exec` (built in). Install Node ≥ 22.12. |
| **Linux** | `bubblewrap` (`bwrap`), `socat`, and `ripgrep` on `PATH`; user namespaces enabled. Example: `sudo apt-get install -y bubblewrap socat ripgrep` |
| **Windows** | Alpha support in upstream srt; not exercised by this demo. |

Real srt execution uses a **child Node process** (`node node_modules/@anthropic-ai/sandbox-runtime/dist/cli.js` and `SandboxManager` via dynamic import) because srt targets Node ≥ 22.12 and is validated against the Node runtime.

Settings files are written under `apps/sandbox-runtime-playground/.tmp/srt-settings/` — never to `~/.srt-settings.json`.

## Tests

```bash
bun test
```

Covers the settings builder and mock policy engine.

## Pinned dependencies (npm publish time)

Verified ≥ 72 hours before install on 2026-10-27.

| Package | Version | Published (UTC) |
| --- | --- | --- |
| `@anthropic-ai/sandbox-runtime` | 0.0.81 | 2026-10-20T01:13:23.926Z |
| `react` | 19.3.1 | 2026-10-14T16:47:15.290Z |
| `react-dom` | 19.3.1 | 2026-10-14T16:49:10.081Z |
| `vite` | 8.3.3 | 2026-10-06T04:10:19.326Z |
| `@vitejs/plugin-react` | 6.1.2 | 2026-10-05T10:08:27.143Z |
| `typescript` | 5.8.3 | 2025-04-05T00:17:37.851Z |
| `shadcn` (CLI) | 4.22.1 | 2026-10-18T18:12:18.511Z |
| `tailwindcss` | 4.3.3 | 2026-07-16T12:03:35.267Z |
| `@tailwindcss/vite` | 4.3.3 | 2026-07-16T12:04:06.316Z |
| `@base-ui/react` | 1.9.0 | 2026-10-09T08:52:43.788Z |
| `class-variance-authority` | 0.7.1 | 2024-11-26T08:20:34.604Z |
| `cn` | 0.5.0 | 2026-10-16T12:59:28.723Z |
| `@fontsource-variable/inter` | 5.3.0 | 2026-07-19T03:50:25.793Z |
| `@hugeicons/core-free-icons` | 4.3.5 | 2026-09-21T11:12:45.182Z |
| `@hugeicons/react` | 1.1.10 | 2026-08-21T02:35:36.791Z |
| `tw-animate-css` | 1.4.0 | 2025-09-24T05:25:53.055Z |
| `oxlint` | 1.88.0 | 2026-10-13T09:47:46.926Z |
| `@types/node` | 26.6.5 | 2026-10-09T18:46:47.657Z |
| `@types/react` | 19.3.0 | 2026-09-09T18:08:49.750Z |
| `@types/react-dom` | 19.3.0 | 2026-09-09T18:07:51.886Z |

**srt 0.0.81 transitive pins (resolved):**

| Package | Version | Published (UTC) |
| --- | --- | --- |
| `zod` | 3.25.76 | 2025-07-08T09:10:18.684Z |
| `commander` | 12.1.0 | 2024-05-18T11:16:54.043Z |
| `node-forge` | 1.4.0 | 2026-03-24T21:44:34.668Z |
| `@pondwader/socks5-server` | 1.0.10 | 2024-06-29T10:33:38.995Z |

## License

Application code in this folder follows the repo license. `srt` is [Apache-2.0](https://github.com/anthropics/sandbox-runtime/blob/main/LICENSE).
