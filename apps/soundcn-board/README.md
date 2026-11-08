# soundcn Board

Compact local soundboard demo using **real** [soundcn](https://github.com/kapishdima/soundcn) registry modules at commit `7cbfbb3f56e8548b81fb26410bdcea657447d087`.

## Commands

```bash
cd apps/soundcn-board
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

## Architecture

- `src/lib/soundcn/` — `sound-engine`, `sound-types`, Kenney CC0 sound modules, preset catalog
- `src/hooks/use-sound.ts` — adapted registry hook (MIT) with stop-on-mute
- `src/features/board/` — UI slots, master controls, event log

Playback requires an explicit user gesture (click / toggle / preview). Audio stays locked behind **Enable sound** until the user opts in — no `AudioContext`, resume, or decode runs before that gesture (lazy decode on first play only).

Lockfile age evidence: `dependency-evidence.json` + full per-package `lockfile-dependency-evidence.json` (356 packages audited).

## Attribution

| Layer | License |
|-------|---------|
| soundcn registry code | MIT © KapishDima |
| Embedded sounds | CC0 · Kenney (per `SoundAsset.license`) |
| This app | Monorepo demo |

WoW/Blizzard asset packs are **not** used (per upstream README).

See `dependency-evidence.json` for npm pin ages (72h cutoff: 2026-11-05 09:02 IST).
