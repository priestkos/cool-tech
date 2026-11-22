# Reverb Voice Lab

Browser voice-cloning demo using **runntime** `createTextToSpeech()` and Reverb on **WebGPU**. No mock mode, no API keys.

## Pins (verified ≥72h before 2026-11-22 IST)

| Package | Version |
| --- | --- |
| `runntime` | 0.3.0 |
| `typegpu` | 0.12.10 |
| `@huggingface/transformers` | 4.3.2 |
| `@huggingface/tokenizers` | 0.1.3 |
| `js-tiktoken` | 1.0.21 |
| `tinyest` | 0.3.4 |
| `tsover-runtime` | 0.0.7 |
| `typed-binary` | 4.3.5 |
| `base64-js` | 1.5.1 |

**Weights:** [software-mansion/Reverb-TTS](https://huggingface.co/software-mansion/Reverb-TTS) revision `9c0da9ddfd47619375ce8e5aeede4681fe32d24d` (int4 runtime path). **License:** CC BY-NC 4.0 (non-commercial). Upstream: [software-mansion-labs/Reverb-TTS](https://github.com/software-mansion-labs/Reverb-TTS) (Apache-2.0).

## Run

```bash
cd apps/reverb-voice-lab
bun install
bun run dev
```

Open the printed local URL in a **WebGPU-capable** browser (recent Chrome/Edge/Safari 26+).

## Scripts

- `bun run dev` — Vite dev server (COOP/COEP headers for OPFS cache)
- `bun run build` — `tsc -b` + production bundle
- `bun run test` — unit tests (WAV + clip duration)
- `bun run lint` — oxlint

## Features

- WebGPU probe and fallback message
- Record or upload a 3–10 s reference clip + transcript
- Seven languages (EN, DE, FR, ES, IT, PL, PT)
- `createVoiceMaker` + `createTextToSpeech` synthesis, RTF display
- Waveform player and WAV download
- Last five generations in memory

## Ethics

Only clone voices you own or have permission to use. See model card for CC BY-NC 4.0 terms.