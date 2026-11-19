# Eve Agent Lab — plan

## Goal

Single-user local lab that runs the real `eve@1.0.0` agent (mock model by default) behind a Vite React UI with agent-folder editing, chat, tool timeline, approval gates, crash/resume, and in-memory OTel spans.

## Single-user MVP (in)

- `agent/` tree with `instructions.md`, tools, `mockModel` scripted turns, `send_refund` approval, durable workflow for crash demos.
- `eveVite()` proxies `/eve/v1/*`; `useEveAgent` chat, timeline, approve/deny, session resume.
- Lab middleware: read/write `instructions.md`, simulate crash (SIGTERM eve dev child), fetch spans + step log.
- shadcn-minimal shell, tests, README, evidence, tracking.

## Explicit outs

- Not an official Vercel product; no deploy, multi-user auth, or live model by default.
- No full transitive npm audit beyond lockfile + direct pins documented in `dependency-evidence.json`.

## Vertical slices

1. Agent + mock model + approval/durable tools.
2. Vite + eve plugin + lab API.
3. React lab UI (folder, chat, timeline, traces, crash).
4. Tests, docs, artifacts, PR.

## Stack

- **Node 24 + Bun + Vite 8 + React 19 + eve/vite + eve/react** — documented eve integration; mock model offline.
- **Tailwind 4 + shadcn (base-mira)** — matches cool-tech demo chrome.
- **@opentelemetry/sdk-trace-base InMemorySpanExporter** — lab trace panel without network export.

## Testing

- `bun test`: mock responder, instructions IO, integration against local eve HTTP API when `EVE_TEST_URL` set.
- Browser smoke desktop + mobile via computer use; screen recording for PR.

## Deferred

- Vercel deploy with `withEve`.
- Real AI Gateway model switch without restart.