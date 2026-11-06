# VybBench Lab — PLAN

**Goal:** One page that shows the published VybBench 1.0 design-fidelity scoreboard and a mock before/after fidelity viewer — offline, no Python scorer, no model APIs.

Source buzz: https://x.com/anurahk/status/2118423168612528242. Upstream: https://github.com/cocolabsai/vybbench (Apache-2.0), dataset https://huggingface.co/datasets/cocolabs/vybbench (CC-BY-4.0), post https://cocolabs.ai/blog/introducing-vybbench. Unofficial community demo; fixture scores + illustrative mocks only (upstream HEAD too new for a 3-day git pin).

## Single-user MVP
1. Font / Color / Edit scoreboard tables from bundled JSON (published VybBench 1.0 numbers).
2. Simple bar charts per metric family.
3. Fidelity viewer with mock before/after panels and edit diff-heat toggle.
4. Model detail drawer; URL state; header with links, disclaimer, credits.

**Out of scope:** running vybbench CLI, HF downloads, live model calls, adding new models, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for every package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Score fixture JSON + ranking helpers + tests.
3. Scoreboard tables + charts.
4. Fidelity viewer mocks (generate SVGs) + diff heat.
5. Model detail, URL state, README (credits, pins with dates, licence table, mock caveats), screenshot and video, PR.

## Stack
- Bundled score JSON + SVG mocks: the subject.
- Vite + React + TS, shadcn/ui minimalist preset: repo standard.

## Deferred
- Live rescored runs; HF dataset browser; multi-iteration drift viz.
