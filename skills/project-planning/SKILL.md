---
name: project-planning
description: Use when starting a new project, scoping an idea, choosing a stack, or producing an MVP implementation plan; an opinionated Bun/shadcn planning skill
---

# Project planning

Turn a fresh project idea into a focused, MVP-first plan that favors prebuilt solutions and opinionated frameworks over custom complexity.

## Workflow

1. Clarify the goal in one sentence and define the single-user MVP boundary: what ships in the first cut, what is explicitly out of scope.
2. Decompose into a small set of tasks grouped by user-visible outcome, not layer.
3. Research frameworks/libraries that could absorb whole tasks (parallel subagents if available, one per question; ask for a recommendation plus main tradeoff; synthesize the decision yourself).
4. Start from an official scaffold via `bunx create-*` (`create-next-app`, `create-vite`, `create-t3-app`, `create-tanstack`, `create-expo`) instead of hand-rolling.
5. Before any dependency install, create or preserve `bunfig.toml` with `[install] minimumReleaseAge = 259200`; prefer scaffold flags that skip the initial install, then `bun install`.
6. Pick one opinionated framework (Next.js, TanStack Start...) when it removes wiring decisions; skip framework-grade tooling for one-screen utilities.
7. For UI, `bunx shadcn@latest init` with a minimalist preset, prefer shadcn blocks, add components on demand with `bunx shadcn@latest add <component>`.
8. Lay out components/services in a logical structure before code.
9. Decide the minimum useful testing surface and git-hook surface; both default to small.
10. Produce a short plan: goal, MVP scope, task list, stack choices with one-line rationale, deferred items.

## Rules

- Build for one user first.
- Bun by default.
- Prefer prebuilt over bespoke.
- Boring, well-documented defaults.
- Cut features before clarity.
- Organize by feature/domain once there is more than one screen.
- Tests for critical logic only.
- Git hooks for formatting and fast static checks only.
- Defer anything not on the path to a working MVP.
- Re-evaluate after the first end-to-end slice runs.

## Output shape

- Goal in one sentence.
- Single-user MVP + explicit outs.
- Outcome-oriented task list (vertical slices).
- Stack with one-line rationale each.
- Deferred items and why.
