# Mirage Terminal Lab — plan

## Goal

Single-user browser lab demonstrating `@struktoai/mirage-browser@0.1.0` with offline RAM mounts, session profiles, shell presets, and a command log.

## MVP

- Vite + React UI: terminal input, mount tree, profile switcher, log/trace panel, presets, About.
- Shared `lib/mirage-lab.ts` used by UI and Bun tests.
- Bun tests for grep, pipes, read-only writes, profile hide/deny, logging, zero network.
- Playwright smoke + screenshot + screen recording for PR.

## Out of scope

- Real cloud VFS, machines with peer deps (e2b, pyodide), server-side API.

## Stack

- Bun, Vite 8, React 19, shadcn base-mira, Mirage 0.1.0 browser build.