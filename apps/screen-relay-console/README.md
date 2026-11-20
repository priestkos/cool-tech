# screen-relay Console

Independent lab for [Vercel Labs screen-relay](https://github.com/vercel-labs/screen-relay) (**Apache-2.0**, Copyright 2026 Vercel Inc.). Uses the published npm package **`screen-relay@0.1.0`** (tag `v0.1.0`, commit `ff50f4327fabe834f09fe774158297aa481d23d9`) — `createClient`, `connect`, `screenshot`, `click`, `type`, `key`, `status`, `capabilities` — not a reimplemented control harness.

Launch context: [ctatedev on X](https://x.com/ctatedev/status/2123261550399995944). Docs: [relay.labs.vercel.dev](https://relay.labs.vercel.dev).

## Commands

```bash
cd apps/screen-relay-console
bun install
bun run dev      # http://127.0.0.1:5173 — lab API + UI
bun test
bun run typecheck
bun run build
```

**Node ≥22** is required for the `screen-relay` SDK (see upstream `engines`). The Vite dev server runs on Node; Bun drives install and tests.

## Running the real upstream project

On a machine with a display and build deps:

```bash
npx screen-relay@0.1.0 install    # first time: system packages + engine build
screen-relay up -d                # loopback http://127.0.0.1:8080
screen-relay doctor
```

Then use **Start / attach** in this lab (live mode). The npm tarball does not ship a prebuilt engine; `install` compiles C++ sources locally. Linking system **x264** (GPL-2.0-or-later) applies to a built engine — we do not vendor or attach a prebuilt engine in this repo. See upstream `THIRD-PARTY-NOTICES.md` and `THIRD_PARTY_LICENSES` here.

## Architecture

| Area | Role |
|------|------|
| `server/session-manager.ts` | Attach live SDK on `127.0.0.1:8080` or mock client |
| `server/mock-relay.ts` | SDK-shaped mock with PNG `screenshot()` frames |
| `server/agent-loop.ts` | Screenshot → click → type → key → screenshot |
| `server/relay-lab-api.ts` | Vite middleware `/api/lab/*` |
| `src/features/lab/*` | Control, viewer, agent loop, doctor UI |

**Mock mode** (default when no engine): replays generated PNG frames, same API shape, zero external runtime requests. **Live mode**: SDK + optional iframe to the engine viewer (H.264 WebCodecs). Only one of panel or viewer may hold input control.

## Verification

This cloud agent environment had **no `relay-engine`** (`screen-relay doctor` → install required). The demo was validated in **mock mode**; doctor JSON is surfaced in the UI.

## Credits

Not an official Vercel product. `screen-relay` is Apache-2.0 © 2026 Vercel Inc. Full upstream license text is summarized in `THIRD_PARTY_LICENSES`.