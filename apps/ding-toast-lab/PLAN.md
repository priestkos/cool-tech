# Ding Toast Lab — PLAN

**Goal:** Single-toast playground with in-place morph transitions between success, error, promise resolve/reject, progress, and Undo — inspired by [Ding](https://github.com/YusufCeng1z/ding), not integrated with upstream.

## Mode: inspired / fixture-only

Upstream `@yusufceng1z/ding` v0.0.2 and latest commit (2026-11-07) are **not** 72h old at launch. This demo independently implements generic toast behavior with React state and CSS/WAAPI easing. No upstream packages, source, or assets.

- Commit eligibility: 2026-11-10 08:09:04 IST  
- Release eligibility: 2026-11-10 08:29:18 IST  

## Single-user MVP

1. Graphite/ivory playground with control cards and central live toast stage.
2. One toast morphs in place (no duplicate stack).
3. Deterministic promise/progress fixtures; stale-completion cancellation.
4. Undo reverses a local archive mutation on sample items.
5. a11y: live region, progressbar values, Escape dismiss, `prefers-reduced-motion`, optional motion toggle.
6. Hover/focus pauses auto-dismiss.

**Out of scope:** real APIs, sound, queues, framework ports, upstream Ding import.

## Stack

- Vite 8 + React 19 + TypeScript — lean one-screen utility.
- shadcn minimalist (`base-mira`) + Base UI — controls only.
- Native CSS transitions / WAAPI — spring-like morph without extra animation libs.

## Dependency age (baseline cutoff 2026-11-04 10:09 IST)

| Package | Version | Published (IST) |
|---------|---------|-----------------|
| react | 19.3.1 | 2026-10-14 22:17:15 |
| react-dom | 19.3.1 | 2026-10-14 22:19:10 |
| vite | 8.3.5 | 2026-10-21 12:08:54 |
| typescript | 6.0.3 | 2026-04-17 05:08:27 |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 15:38:27 |
| tailwindcss | 4.3.3 | 2026-07-16 17:33:35 |
| @tailwindcss/vite | 4.3.3 | 2026-07-16 17:34:06 |
| shadcn | 4.22.1 | 2026-10-18 23:42:18 |
| clsx | 2.1.1 | 2024-04-23 10:56:04 |
| tailwind-merge | 3.7.0 | 2026-09-13 01:40:15 |
| class-variance-authority | 0.7.1 | 2024-11-26 13:50:34 |
| @types/react | 19.3.0 | 2026-09-09 23:38:49 |
| @types/react-dom | 19.3.0 | 2026-09-09 23:37:51 |
| @types/bun | 1.4.4 | 2026-10-23 05:39:43 |
| @types/node | 24.19.2 | 2026-10-10 00:14:25 |
| create-vite | 8.0.0 | 2025-09-23 13:49:32 |
| @base-ui/react | 1.9.0 | 2026-10-09 14:22:43 |
| tw-animate-css | 1.4.0 | 2025-09-24 10:55:53 |

## Tasks

1. Scaffold + pins + shadcn shell. ✓
2. Toast model + tests.
3. ToastStage morph + fixtures + playground.
4. README, artifacts, tracking JSON, PR.
