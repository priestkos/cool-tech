# Glorpies Agent Roster

Unofficial community demo. Not affiliated with glorpies or sunrakerr. Agents shown are fictional.

One-page browser demo of [glorpies](https://github.com/sunrakerr/glorpies): a fake AI-agent team roster whose avatars reflect each agent’s state, plus a seed explorer for any string or numeric seed. Source buzz: [friednoodlz on X](https://x.com/friednoodlz/status/2117254897506902154).

## Run

```bash
cd apps/glorpies-agent-roster
bun install
bun run dev
```

Also: `bun test`, `bun run lint`, `bun run build`.

## Features

- Roster of fictional agents with `Glorpie` faces, simulate task loop, activity log, manual state + poke
- Size strip at 24 / 32 / 48 / 96 px (`auto` look switches below 72 px)
- Seed explorer: `seedOf`, six states, looks / shapes / background, random name, add to roster, SVG + PNG export
- State persisted in URL hash and `localStorage`

## Credits

Avatars by glorpies (MIT) by [sunrakerr](https://github.com/sunrakerr).

## Pinned dependencies (publish dates, UTC)

| Package | Version | Published |
| --- | --- | --- |
| glorpies | 0.1.1 | 2026-11-01 |
| react / react-dom | 19.3.1 | 2026-10-14 |
| vite | 8.3.5 | 2026-10-21 |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 |
| typescript | 6.0.3 | 2026-04-16 |
| tailwindcss / @tailwindcss/vite | 4.3.3 | 2026-07-16 |
| shadcn (CLI) | 4.22.1 | 2026-10-18 |
| @base-ui/react | 1.9.0 | (via shadcn init; lockfile 1.9.0) |
| @hugeicons/core-free-icons | 4.4.0 | (via shadcn components; lockfile 4.4.0) |
| @hugeicons/react | 1.1.10 | (via shadcn components; lockfile 1.1.10) |
| class-variance-authority | 0.7.1 | (via shadcn; lockfile 0.7.1) |
| sonner | 2.0.8 | (via shadcn; lockfile 2.0.8) |
| tw-animate-css | 1.4.0 | (via shadcn; lockfile 1.4.0) |
| cn | 0.5.0 | 2026-10-16 |
| lucide-react | 1.61.0 | (pinned; pre-3-day alternatives exist) |
| oxlint | 1.90.0 | 2026-10-27 |
| @types/react / @types/react-dom | 19.3.0 | 2026-09-09 |
| @types/bun | 1.4.4 | 2026-10-23 |
| @types/node | 24.19.2 | 2026-10-09 |

All installs use `bunfig.toml` `[install] minimumReleaseAge = 259200` (72 hours).

## Licence

| Component | Licence |
| --- | --- |
| This demo app | MIT (same repo policy) |
| glorpies | MIT |
| React, Vite, Tailwind, shadcn/ui stack | MIT / Apache-2.0 (TypeScript) as per upstream |
