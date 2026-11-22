/** Hugging Face revision pinned per demo brief (2026-11-19). */
export const REVERB_HF_REVISION =
  "9c0da9ddfd47619375ce8e5aeede4681fe32d24d" as const

const HF_REPO = `https://huggingface.co/software-mansion/Reverb-TTS/resolve/${REVERB_HF_REVISION}`

/** Codec weights stay on runntime’s pinned Hub commit (separate repo). */
const CODEC_PATH =
  "https://huggingface.co/software-mansion/higgs-audio-v2-tokenizer-Reverb/resolve/e0d9ccd2935d7f953764a83b09444dc0677a44a0/combined/safetensors/d8e8/model.safetensors"

/** Reverb int4 DEFAULT layout at the pinned revision. */
export const REVERB_MODEL_CONFIG = {
  modelPath: `${HF_REPO}/model/runntime/int4/model.safetensors`,
  codecPath: CODEC_PATH,
  tokenizerPath: `${HF_REPO}/model/tokenizer.json`,
} as const

export const REVERB_SAMPLE_RATE = 24_000

export const REFERENCE_MIN_SECONDS = 3
export const REFERENCE_MAX_SECONDS = 10