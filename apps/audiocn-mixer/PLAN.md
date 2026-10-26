# Audio Mixer Board — PLAN

**Goal:** A one-page mixing desk where a test tone, a generated drum loop, your microphone and an audio file each get a channel strip with a live meter, fader, pan, mute and solo, summed into a master LCD meter, all built from audiocn components on the Web Audio API.

Source buzz: https://x.com/orcdev/status/2114276275934355727 (@orcdev, Oct 2026). Source: https://www.audiocn.dev, https://github.com/audiocn/ui (MIT).

## Single-user MVP
1. "Start audio" button that creates/resumes the shared AudioContext (browsers need a gesture) and a status badge (running/suspended).
2. Four channel strips in an audiocn `Mixer`, each `ChannelStrip` with a `LevelMeter` (peak and RMS), `Fader` in dB, `PanControl`, mute and solo toggles, and a dB readout:
   - Test tone: an OscillatorNode (sine, 440 Hz default, with a small frequency control) at -18 dBFS.
   - Generated sample: a short drum-style loop synthesized into an AudioBuffer in code (kick, hat, snare from oscillators and noise), looping through an AudioBufferSourceNode.
   - Microphone: `useMicrophone`, opened only on click. Permission denied or no device shows a clear inline notice and the strip stays idle; the rest of the board keeps working.
   - Audio file: pick or drag in any local audio file, played through an `<audio>` element with play/pause and loop.
3. Routing via `useMixer` + `useWebAudioMixer`: post-fader meters per channel from AnalyserNodes, mute/solo as click-free gain ramps, monitor on for tone, sample and file, off for the mic by default (a "Monitor mic (use headphones)" toggle).
4. Master section: an `LcdDisplay` with `LcdMeter` (stereo, held peak, CLIP flag) fed by `master.meter`, a master fader, and a clip indicator with reset.
5. Light/dark theme toggle (audiocn follows the shadcn theme) and a footer credit to audiocn (MIT).

**Out of scope:** recording/exporting the mix, ducking UI, system/tab audio capture, device pickers, effects (EQ, compressor), saving sessions, backend, deploy.

## Tasks (vertical slices)
1. Read the audiocn installation, llms.txt and the .md pages for every item used. Check every pin is at least 3 days old. Scaffold Vite React TS (skip install), bunfig.toml, install pinned versions, shadcn init (minimalist, Tailwind v4), add the @audiocn registry, add the items, license notice.
2. Start audio, the test-tone channel end to end: oscillator → `useWebAudioMixer` → channel strip with meter, fader, pan, mute/solo.
3. Generated drum loop and audio-file channels; master LCD meter, master fader and clip indicator.
4. Microphone channel with permission fallback and the monitor toggle; theme toggle.
5. README, screenshot and video (fake media devices in headless Chromium), PR.

## Stack
- audiocn registry items (copied in with the shadcn CLI): the tech being demoed; meters paint on the animation frame without React re-renders.
- Web Audio API (OscillatorNode, AudioBufferSourceNode, MediaElementSource, AnalyserNode via audiocn's hooks): no audio library needed.
- Vite + React 19.3 + TS: least wiring for a client-only one-screen app, and audiocn needs React 19.2+.
- shadcn/ui minimalist preset on Tailwind v4 (button, card, switch, badge, slider, sonner): repo standard and audiocn's base.

## Deferred
- Recording the master via `output` and MediaRecorder, ducking the music under the mic, sound pads, spectrum view: nice to have.
- Device selection (`audio-device-select` needs a Base UI project): later.
- Tests beyond the drum-loop buffer generator (length, no NaN, peak under 0 dBFS) and the channel config: critical logic only.
