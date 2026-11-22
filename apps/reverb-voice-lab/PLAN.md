# Reverb Voice Lab — PLAN

**Goal:** Browser voice-cloning TTS demo using real `runntime` `createTextToSpeech()` over WebGPU with pinned Reverb-TTS weights.

## Single-user MVP
1. WebGPU check with clear fallback when unavailable.
2. Record or upload a 3–10 s reference clip + transcript; validate duration.
3. Text input + language picker (EN, DE, FR, ES, IT, PL, PT).
4. Generate cloned speech via `createTextToSpeech` / `createVoiceMaker`.
5. Waveform player with WAV download; show real-time factor.
6. In-memory history (~5 generations, replayable).
7. Ethics notice + CC BY-NC 4.0 / upstream credits.

**Out of scope:** server API, mock mode, Verbalis, deploy, persistence beyond session.

## Stack
- Vite + React 19 + TS + shadcn minimalist — repo standard, client-only WebGPU.
- `runntime@0.3.0` + `typegpu@0.12.10` — pinned TTS stack per brief.
- Weights: HF `software-mansion/Reverb-TTS` revision `9c0da9d` (int4 DEFAULT paths).

## Tasks
1. Scaffold, pins, `bunfig.toml`, lockfile.
2. Engine hook: `initRunntime`, load TTS + voice maker, OPFS cache optional.
3. Reference clip UI (record/upload, duration validation).
4. Synthesis UI + RTF + history + waveform/download.
5. README, tracking JSON, build/test, PR artifacts.