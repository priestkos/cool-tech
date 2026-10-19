# Sonic UI Kit — PLAN

**Goal:** Show off Sound Lab by React Bits by wiring its installable, code-generated UI sounds into a small shadcn component playground.

Source: React Bits Sound Lab (https://reactbits.dev/tools). Launch post: https://x.com/davidhaz/status/2111778331062624385

## Single-user MVP
1. Sound-wired gallery: shadcn Button, Switch, Tabs, Dialog and Toast (sonner), each playing a Sound Lab interface sound on its key interaction.
2. Per-component sound picker: a Select next to each component to swap which installed sound it plays (from the 4-8 sounds installed into the repo).
3. Global mute switch + volume slider, persisted in localStorage.
4. Reduced sound: when `prefers-reduced-motion: reduce` matches, default to muted (or much lower volume) with a visible badge; the user can override.
5. Notification-center scene: buttons fire success / error / info toasts, each with its own sound.
6. "Sounds as code" explainer page: shows one installed sound's TS source next to a play button and explains that sounds are installed as code, not audio files.

**Out of scope:** auth, backend, video-editing sounds, exporting WAV/MP3, deploy, custom sound synthesis beyond what Sound Lab ships.

## Tasks (vertical slices)
1. Scaffold Vite + React + TS with `bunx create-vite@latest . --template react-ts` (skip install), add bunfig.toml, `bun install`, shadcn init (minimalist preset).
2. Find the REAL Sound Lab install command and usage API in the React Bits docs at https://reactbits.dev (Sound Lab under /tools). Do not guess the command; if the shadcn registry URL differs, use exactly what the docs show. Install 4-8 interface sounds (tap, toggle, notification, success, error, etc.).
3. `SoundProvider` context: volume, muted, reducedSound, per-component sound map, all persisted to localStorage; `useSound(id)` hook that plays the mapped sound respecting volume/mute.
4. Gallery page with the sound-wired components and per-component pickers.
5. Notification-center scene with toasts.
6. "Sounds as code" page (simple tab or route) rendering one sound's TS source.
7. README, screenshot + video, PR.

## Stack
- Vite + React + TS: one-screen utility, no framework wiring needed.
- shadcn/ui (minimalist preset) + sonner: prebuilt components, matches repo rules.
- React Bits Sound Lab sounds via its documented shadcn install: the tech being demoed.
- localStorage: enough persistence for one user.

## Deferred
- Video-editing sounds and the timeline use case (not needed to show the idea).
- Deploy preview (optional per AGENTS.md).
- Tests beyond a small unit test for the settings persistence logic.
