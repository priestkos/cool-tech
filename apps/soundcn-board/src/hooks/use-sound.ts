import { useCallback, useEffect, useRef, useState } from "react"
import { decodeAudioData, getAudioContext } from "@/lib/soundcn/sound-engine"
import type {
  SoundAsset,
  UseSoundOptions,
  UseSoundReturn,
} from "@/lib/soundcn/sound-types"

/**
 * Adapted from soundcn registry/soundcn/hooks/use-sound.ts @ 7cbfbb3f…
 * (MIT). Lazy decode on play(); stop when soundEnabled becomes false.
 */
export function useSound(
  sound: SoundAsset,
  options: UseSoundOptions = {},
): UseSoundReturn {
  const {
    volume = 1,
    playbackRate = 1,
    interrupt = false,
    soundEnabled = true,
    stopOnUnmount = true,
    onPlay,
    onEnd,
    onPause,
    onStop,
  } = options

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState<number | null>(
    sound.duration ?? null,
  )
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const decodeRef = useRef<Promise<AudioBuffer> | null>(null)
  const stopOnUnmountRef = useRef(stopOnUnmount)

  useEffect(() => {
    stopOnUnmountRef.current = stopOnUnmount
  })

  useEffect(() => {
    bufferRef.current = null
    decodeRef.current = null
    setDuration(sound.duration ?? null)
  }, [sound.dataUri, sound.duration])

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch {
        // Already stopped
      }
      sourceRef.current = null
    }
    gainRef.current = null
    setIsPlaying(false)
    onStop?.()
  }, [onStop])

  useEffect(() => {
    if (!soundEnabled) {
      stop()
    }
  }, [soundEnabled, stop])

  const ensureBuffer = useCallback(async (): Promise<AudioBuffer | null> => {
    if (!soundEnabled) return null
    if (bufferRef.current) return bufferRef.current
    if (!decodeRef.current) {
      decodeRef.current = decodeAudioData(sound.dataUri).then((buffer) => {
        bufferRef.current = buffer
        setDuration(buffer.duration)
        return buffer
      })
    }
    try {
      return await decodeRef.current
    } catch {
      return null
    }
  }, [sound.dataUri, soundEnabled])

  const play = useCallback(
    (overrides?: { volume?: number; playbackRate?: number }) => {
      if (!soundEnabled) return

      void (async () => {
        const buffer = await ensureBuffer()
        if (!buffer) return

        const ctx = getAudioContext()

        if (ctx.state === "suspended") {
          await ctx.resume()
        }

        if (interrupt && sourceRef.current) {
          stop()
        }

        const source = ctx.createBufferSource()
        const gain = ctx.createGain()

        source.buffer = buffer
        source.playbackRate.value = overrides?.playbackRate ?? playbackRate
        gain.gain.value = overrides?.volume ?? volume

        source.connect(gain)
        gain.connect(ctx.destination)

        source.onended = () => {
          setIsPlaying(false)
          sourceRef.current = null
          gainRef.current = null
          onEnd?.()
        }

        source.start(0)
        sourceRef.current = source
        gainRef.current = gain
        setIsPlaying(true)
        onPlay?.()
      })()
    },
    [
      soundEnabled,
      playbackRate,
      volume,
      interrupt,
      stop,
      onPlay,
      onEnd,
      ensureBuffer,
    ],
  )

  const pause = useCallback(() => {
    stop()
    onPause?.()
  }, [stop, onPause])

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume
    }
  }, [volume])

  useEffect(() => {
    return () => {
      if (stopOnUnmountRef.current && sourceRef.current) {
        try {
          sourceRef.current.stop()
        } catch {
          // Already stopped
        }
      }
      sourceRef.current = null
    }
  }, [])

  return [play, { stop, pause, isPlaying, duration, sound }] as const
}
