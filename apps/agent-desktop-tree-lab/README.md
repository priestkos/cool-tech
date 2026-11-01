# Agent Desktop Tree Lab

Unofficial demo inspired by [Vercel Labs' agent-desktop](https://github.com/vercel-labs/agent-desktop). **Not made by or affiliated with Vercel.** Scripted replay in the browser; no real OS control, no AI.

Command names, ref syntax and the JSON envelope follow [vercel-labs/agent-desktop](https://github.com/vercel-labs/agent-desktop) docs @ [`3c3c8a9`](https://github.com/vercel-labs/agent-desktop/commit/3c3c8a956bd080497a90ba94a002b07409836e9a) (Apache-2.0). No agent-desktop code is included. See `THIRD_PARTY_LICENSES/agent-desktop-LICENSE.txt`.

**Source buzz:** [@ctatedev on X](https://x.com/ctatedev/status/2116323148706771302) (Oct 31 2026).

## Run

```bash
cd apps/agent-desktop-tree-lab
bun install
bun run dev
```

Open the printed local URL. No API keys, no network calls at runtime.

## What mock mode is

- The **Jotter** window is a React component; its accessibility tree is derived from the same in-memory model.
- The console replays **scripted** `snapshot`, `click`, `type`, `set-value`, `get`, and `find` commands against an in-browser simulator. Output uses agent-desktop-shaped JSON envelopes (version `2.5`).
- **Mock mode: scripted replay, no real OS control.** Nothing here installs or runs the real CLI.

### What the real CLI does (not exercised here)

The [agent-desktop](https://github.com/vercel-labs/agent-desktop) CLI reads the OS accessibility tree on macOS, Windows, and Linux (permissions required), returns qualified refs `@<snapshot_id>:e<N>`, and acts headless by default (`--headed` for physical input). Multi-agent cursor overlays are supported on macOS and Windows via `session start --cursor --multi-agent` and `--agent-id`.

The disabled **Real mode (not exercised)** control in the UI is intentional: no bridge, server, or shell-out in this MVP.

## Simulated commands and errors

| Command | Mock support |
|---------|----------------|
| `snapshot --app Jotter -i --compact` | Yes — fresh `snapshot_id`, refs on addressable nodes only |
| `click`, `type`, `set-value` | Yes — updates Jotter; invalidates older snapshot refs |
| `get`, `find --role --name` | Yes — simplified matching |
| Other ~50 CLI commands | `"not simulated in this demo"` |

Error codes modeled from [`docs/json-output.md`](https://github.com/vercel-labs/agent-desktop/blob/3c3c8a956bd080497a90ba94a002b07409836e9a/docs/json-output.md): `INVALID_ARGS` (bare `@eN`), `STALE_REF` (reuse after UI change), `SNAPSHOT_NOT_FOUND`, `ELEMENT_NOT_FOUND`, `APP_NOT_FOUND`.

## Token estimates (not measurements)

Per snapshot step, the meter compares:

- **Tree read:** estimated tokens of the minified JSON envelope string (`ceil(UTF-8 bytes / 4)` — a common rule of thumb, not a real tokenizer).
- **Screenshot read:** estimated tokens for the fake window size (or optional 1440×900 full-screen toggle) using `ceil(width × height / 750)` from [Anthropic's Claude vision docs](https://docs.anthropic.com/en/docs/build-with-claude/vision). Other models count differently.

These are **estimates for this mock window**, not measurements of agent-desktop. The viral “198k → 31k tokens” figure from social media is an upstream/third-party claim only — this demo does not reproduce or display it as a result.

## Reference commit (read-only)

| Item | Value |
|------|--------|
| Repo | https://github.com/vercel-labs/agent-desktop |
| Tag / commit | `v1.0.1` / `3c3c8a956bd080497a90ba94a002b07409836e9a` |
| Commit date | `2026-10-27T20:28:55-07:00` |

## Pinned dependencies (verified 2026-11-01)

| Package | Version | Published (UTC) |
|---------|---------|-----------------|
| react | 19.3.1 | 2026-10-14T16:47:15Z |
| react-dom | 19.3.1 | 2026-10-14T16:49:10Z |
| @types/react | 19.3.0 | 2026-09-09T18:08:49Z |
| @types/react-dom | 19.3.0 | 2026-09-09T18:07:51Z |
| vite | 8.3.5 | 2026-10-21T06:38:54Z |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05T10:08:27Z |
| typescript | 6.0.3 | 2026-04-16T23:38:27Z |
| tailwindcss | 4.3.3 | 2026-07-16T12:03:35Z |
| @tailwindcss/vite | 4.3.3 | 2026-07-16T12:04:06Z |
| lucide-react | 1.61.0 | 2026-10-21T06:12:38Z |
| shadcn | 4.22.1 | 2026-10-18T18:12:18Z |
| @types/bun | 1.4.4 | 2026-10-23T00:09:43Z |

`bunfig.toml` sets `[install] minimumReleaseAge = 259200` (72 hours).

## Tests

```bash
bun test
```

Covers tree/snapshot refs, command parser errors, and token math.

## License table

| Component | License |
|-----------|---------|
| This demo (Agent Desktop Tree Lab) | Same as parent repo |
| agent-desktop (inspiration only; LICENSE in `THIRD_PARTY_LICENSES/`) | Apache-2.0 |
| react / react-dom | MIT |
| vite / @vitejs/plugin-react | MIT |
| typescript | Apache-2.0 |
| tailwindcss / @tailwindcss/vite | MIT |
| lucide-react | ISC |
| shadcn CLI / UI primitives (@base-ui/react, etc.) | MIT |
| @types/* | MIT |
