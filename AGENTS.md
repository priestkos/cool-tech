# Agent rules

This repository is a sticky monorepo for daily tech demos. One small, self-contained app per pick. Follow these rules on every task.

## Where demos live

- Never create a new repository per demo. Every demo lives in `apps/<kebab-slug>/` in this repo.
- Cloud agents may only add or update files under `apps/<kebab-slug>/` for their demo (plus `apps/<slug>/PLAN.md`). Don't touch other apps, `skills/`, or `tracking/` unless the task says so.

## Planning and stack

- Plan with `skills/project-planning/SKILL.md` before building. Keep the plan in `apps/<slug>/PLAN.md`.
- Use Bun (runtime, package manager, scripts). Each app is self-contained: `cd apps/<slug> && bun install && bun run dev` must work. Each app has its own `bunfig.toml` with `[install] minimumReleaseAge = 259200`, created before any `bun install` or `bun add`.
- Start from an official scaffold (`bunx create-*`). When there is UI, use the shadcn/ui minimalist preset.

## Pull requests

- Every demo PR must attach both at least one screenshot and at least one video (screen recording) of the app running. Not optional.
- One PR per demo. Build a single-user MVP and keep the scope small.

## Deploy

- Deploy previews (optional later): a single Cloudflare Pages project with a path per `apps/<slug>/`.
