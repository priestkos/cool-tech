const SAMPLE_RATE = 48_000
const BEATS = 4
const BPM = 120
const STEPS_PER_BEAT = 4

export function createDrumLoopBuffer(
  context: BaseAudioContext,
): AudioBuffer {
  const stepDuration = 60 / BPM / STEPS_PER_BEAT
  const totalSteps = BEATS * STEPS_PER_BEAT
  const length = Math.ceil(stepDuration * totalSteps * SAMPLE_RATE)
  const buffer = context.createBuffer(2, length, SAMPLE_RATE)

  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel)
    for (let step = 0; step < totalSteps; step += 1) {
      const stepStart = Math.floor(step * stepDuration * SAMPLE_RATE)
      const beat = step % STEPS_PER_BEAT

      if (step % STEPS_PER_BEAT === 0) {
        renderKick(data, stepStart, SAMPLE_RATE)
      }
      if (beat === 2) {
        renderSnare(data, stepStart, SAMPLE_RATE)
      }
      if (step % 2 === 1) {
        renderHat(data, stepStart, SAMPLE_RATE)
      }
    }
  }

  return buffer
}

function renderKick(data: Float32Array, start: number, sampleRate: number) {
  const duration = Math.floor(0.18 * sampleRate)
  for (let i = 0; i < duration && start + i < data.length; i += 1) {
    const t = i / sampleRate
    const env = Math.exp(-t * 28)
    const freq = 90 * Math.exp(-t * 12) + 40
    const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.55
    data[start + i] += sample
  }
}

function renderSnare(data: Float32Array, start: number, sampleRate: number) {
  const duration = Math.floor(0.12 * sampleRate)
  for (let i = 0; i < duration && start + i < data.length; i += 1) {
    const t = i / sampleRate
    const env = Math.exp(-t * 22)
    const tone = Math.sin(2 * Math.PI * 180 * t) * 0.35
    const noise = (Math.random() * 2 - 1) * 0.65
    data[start + i] += (tone + noise) * env * 0.35
  }
}

function renderHat(data: Float32Array, start: number, sampleRate: number) {
  const duration = Math.floor(0.04 * sampleRate)
  for (let i = 0; i < duration && start + i < data.length; i += 1) {
    const t = i / sampleRate
    const env = Math.exp(-t * 60)
    const noise = (Math.random() * 2 - 1) * env * 0.12
    data[start + i] += noise
  }
}

export function analyzeDrumLoop(buffer: AudioBuffer): {
  length: number
  peak: number
  hasNaN: boolean
} {
  let peak = 0
  let hasNaN = false
  for (let c = 0; c < buffer.numberOfChannels; c += 1) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < data.length; i += 1) {
      const v = data[i]
      if (Number.isNaN(v)) {
        hasNaN = true
      }
      peak = Math.max(peak, Math.abs(v))
    }
  }
  return { length: buffer.length, peak, hasNaN }
}
