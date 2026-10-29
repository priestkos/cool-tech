# Open Code Review Playground

One-screen web playground for [Alibaba Open Code Review](https://github.com/alibaba/open-code-review) (OCR): pick a sample diff with a planted bug (or paste your own unified diff) and see the **real** rule groups OCR matches via `ocr delegate rule`, plus review comments pinned to lines.

Buzz: [X post](https://x.com/thisdudelikesAI/status/2115010135588589932) · Docs: https://open-codereview.ai/docs

## Requirements

- **Bun** 1.4+ (runtime and package manager)
- **Git** 2.41+ (`git --version` on this demo VM: 2.43.0)
- No API key required for mock mode (default)

## Run

```bash
cd apps/open-code-review-playground
bun install
bun run dev
```

Open the Vite URL (usually http://localhost:5173). The dev script starts **both** the Bun API (`127.0.0.1:3955`) and Vite with an `/api` proxy.

## Mock vs real

| Part | Mock (default) | Real mode |
|------|----------------|-----------|
| `ocr review --preview` | Live OCR binary | Live OCR binary |
| `ocr delegate rule` | Live OCR binary | Live OCR binary |
| Review comments | Bundled fixtures in `fixtures/*.review.json` (labelled in UI) | Live `ocr review --format json --audience agent` |

Real mode is enabled only when **all** of these are set in the **server** environment (e.g. `.env.local`, gitignored):

- `OCR_LLM_URL` — OpenAI-compatible base URL
- `OCR_LLM_TOKEN` — bearer token (never sent to the browser)
- `OCR_LLM_MODEL` — model id
- Optional: `OCR_LLM_PROTOCOL` (`openai` default; also `anthropic` or `openai-responses`)

Copy `.env.example` to `.env.local` and fill in placeholders.

### Limits (server-enforced)

- Diff size ≤ **100 KB**, ≤ **10 files**
- **One review at a time** (HTTP 429 if busy)
- Analyze timeout **20 s**; review timeout **4 min** (killed)
- Review uses `--max-tokens-budget 60000`, `--timeout 3` (minutes), `--effort low`
- OCR runs with isolated `HOME` (no `~/.opencodereview`), `OCR_ENABLE_TELEMETRY=false`, and no forwarded `ANTHROPIC_*` / `OPENAI_*` keys

Pasted diffs in mock mode show analyze output only; there is no fixture review unless you enable real mode.

## What OCR “rules” mean

Rule groups are **checklists for the LLM**, not static analyzers that detect bugs. The rules panel states this explicitly.

From OCR’s README (quoted as claims, not verified here): higher precision and about **1/9 of the tokens** vs Claude Code for code review.

## Pinned versions (publish dates)

Verified with `npm view <pkg>@<version> time.modified` on **2026-10-29** (all ≥ 72 h old):

| Package | Version | Published (UTC) |
|---------|---------|-----------------|
| `@alibaba-group/open-code-review` | 1.13.3 | 2026-10-22T05:25:51Z |
| `create-vite` | 9.3.1 | 2026-10-20T03:02:49Z |
| `react` / `react-dom` | 19.3.1 | 2026-10-14T16:47:15Z |
| `vite` | 8.3.5 | 2026-10-21T06:38:55Z |
| `@vitejs/plugin-react` | 6.1.2 | 2026-10-05T10:08:27Z |
| `tailwindcss` / `@tailwindcss/vite` | 4.3.3 | 2026-10-19T16:02:21Z |
| `shadcn` | 4.22.1 | 2026-10-18T18:12:18Z |
| `lucide-react` | 1.61.0 | 2026-10-21T06:12:38Z |
| `@types/bun` | 1.4.4 | 2026-10-23T00:09:43Z |
| `diff` | 9.0.0 | 2026-04-13T12:39:24Z |
| `typescript` | 5.8.3 | (dev; from scaffold policy) |

Install policy: `bunfig.toml` sets `[install] minimumReleaseAge = 259200` (3 days).

## Tests

```bash
bun test
```

Covers diff-to-repo line numbers, argv/env isolation, and one `/api/analyze` round trip on the SQL injection sample.

## License

App code in this folder is part of the cool-tech demos repo. OCR is Apache-2.0 — see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
