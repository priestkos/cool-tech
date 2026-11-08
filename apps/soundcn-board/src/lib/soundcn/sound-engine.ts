let audioContext: AudioContext | null = null
let audioUnlockedByUser = false
const bufferCache = new Map<string, AudioBuffer>()

/** True after explicit Enable sound / user gesture unlock. */
export function isAudioUnlocked(): boolean {
  return audioUnlockedByUser
}

/**
 * Call only from a deliberate user gesture (Enable sound control).
 * Creates and resumes the shared AudioContext.
 */
export function unlockAudioEngine(): void {
  audioUnlockedByUser = true
  if (typeof globalThis.AudioContext !== "undefined") {
    const ctx = getAudioContext()
    void ctx.resume()
  }
}

export function getAudioContext(): AudioContext {
  if (!audioUnlockedByUser) {
    throw new Error("AudioContext is locked until the user enables sound.")
  }
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export async function decodeAudioData(dataUri: string): Promise<AudioBuffer> {
  if (!audioUnlockedByUser) {
    throw new Error("Cannot decode audio before the user enables sound.")
  }

  const cached = bufferCache.get(dataUri)
  if (cached) return cached

  const ctx = getAudioContext()
  const base64 = dataUri.split(",")[1]
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0))
  bufferCache.set(dataUri, audioBuffer)
  return audioBuffer
}

export interface PlaySoundOptions {
  volume?: number
  playbackRate?: number
  onEnd?: () => void
}

export interface SoundPlayback {
  stop: () => void
}

export async function playSound(
  dataUri: string,
  options: PlaySoundOptions = {},
): Promise<SoundPlayback> {
  const { volume = 1, playbackRate = 1, onEnd } = options
  const ctx = getAudioContext()
  if (ctx.state === "suspended") {
    await ctx.resume()
  }

  const buffer = await decodeAudioData(dataUri)
  const source = ctx.createBufferSource()
  const gain = ctx.createGain()

  source.buffer = buffer
  source.playbackRate.value = playbackRate
  gain.gain.value = volume

  source.connect(gain)
  gain.connect(ctx.destination)

  source.onended = () => {
    onEnd?.()
  }

  source.start(0)

  return {
    stop: () => {
      try {
        source.stop()
      } catch {
        // No-op if already stopped.
      }
    },
  }
}

/** Test-only reset */
export function _resetAudioEngineForTests(): void {
  audioContext = null
  audioUnlockedByUser = false
  bufferCache.clear()
}
