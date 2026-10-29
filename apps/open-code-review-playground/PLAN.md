# Open Code Review Playground — PLAN

**Goal:** A one-screen playground where you pick a sample diff with a planted bug (or paste your own) and see how Alibaba's Open Code Review handles it: the rules it matches to each file, review comments pinned to exact lines with severity, and the token cost.

Source buzz: https://x.com/thisdudelikesAI/status/2115010135588589932 (Oct 2026). Official: https://github.com/alibaba/open-code-review and https://open-codereview.ai/docs (Apache-2.0).

## Single-user MVP
1. Header with links to the repo, docs and X post, the OCR and Git versions from /api/status, and a clear MOCK / REAL badge with one line explaining what that mode means.
2. Input panel: a sample picker (SQL injection in Python, null dereference in Java/TS, XSS sink in React) and a textarea to paste a unified diff (max 100 KB, 10 files).
3. Diff view: a unified diff per file with line numbers. Review comments appear inline under the exact line range they target, showing severity, category, the comment text, and the suggested code when there is any.
4. Severity filter (critical, high, medium, low, unrated) with counts. It hides or shows the inline comments.
5. Rules panel: the real rule groups OCR matched (`ocr delegate rule`). For each group it shows the pattern, its files, and the section titles, which expand to show their checklist. A comment's category links to the related section where it is obvious.
6. Token readout: total, input and output tokens and elapsed time from the review summary, labelled "sample" in mock mode and "live" in real mode.
7. Run review button: in mock mode it loads the sample fixture; in real mode it runs `ocr review` with a token budget and shows a progress state, then the results or a readable error.

**Out of scope:** `ocr scan`, delegation-mode host agents, CI/GitHub integration, sessions and resume, the OCR web viewer, custom rule.json editing, MCP tools, persistence, auth, deploy.

## Tasks (vertical slices)
1. Check that every pinned package is at least 3 days old. Scaffold Vite React TS (skip install), bunfig.toml, install the pinned versions, and confirm the OCR binary prints v1.13.3. Run shadcn init (minimalist).
2. Bun.serve server: /api/status, and /api/analyze using the temp git repo builder (samples and pasted diffs), preview and `delegate rule` (fixed argv, isolated env, limits, cleanup). One `bun run dev` for the server and Vite, with the Vite proxy.
3. UI: sample picker and paste box, diff view, rules panel from real analyze output.
4. Reviews: mock fixtures in OCR's JSON schema for the three samples, inline pinned comments, severity filter, token readout. Real mode via /api/review when the env vars are set.
5. Tests for the diff-to-repo builder, the argv/env builder and one analyze round trip. README, THIRD_PARTY_NOTICES.md, screenshot and video, PR.

## Stack
- `@alibaba-group/open-code-review` 1.13.3 (Go CLI via its platform package): the tech being demoed, pinned past the 3-day rule.
- Bun.serve: OCR is a native CLI that needs a git repo, so it must run on the host, and this is the smallest server with no extra framework.
- `diff` 9.0.0 (`parsePatch`): reliable unified-diff parsing for the viewer and the pasted-diff repo builder.
- Vite + React + TS with a dev proxy: least wiring for a one-screen client.
- shadcn/ui minimalist preset (select, textarea, toggle-group, badge, card, collapsible, button, alert): repo standard.

## Deferred
- `ocr scan` for whole files, and a side-by-side compare of two sessions: nice extras once the diff flow works.
- Delegation mode, where the coding agent reviews using OCR's rules: needs a host agent, so it doesn't fit a web page.
- SARIF export and a GitHub Action: belong in CI, not a playground.
- Deploy preview: needs a host runtime that can run the OCR binary, so it comes later.
