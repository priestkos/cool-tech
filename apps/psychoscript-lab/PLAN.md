# Psychoscript Lab — plan

## Goal

Offline lab UI around real `psychoscript@0.3.0`: run confined scripts against mock host tools, log calls, pause/resume snapshots (including child process), fork, escape probes.

## MVP scope

- Bun API server + Vite React chrome (shadcn minimalist).
- Presets, editor, tool log, pause/download, resume, child resume, fork, corrupt snapshot, suspend-blocked demo, escape panel, about.

## Out of scope

- Effect integration, deploy, real network tools.

## Stack

- psychoscript@0.3.0, Bun.serve, Vite 8, React 19, Tailwind 4, playwright browser smoke.

## Tasks

1. `lib/host-factory.ts` + presets + tests.
2. Server routes + resume child script.
3. React lab UI.
4. README, tracking, PR artifacts.