import { useEffect, useRef, useState } from "react"
import type { OrbAudioSource } from "talking-marble"

export function useMockOscillator(enabled: boolean) {
  const [node, setNode] = useState<OrbAudioSource | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    cleanupRef.current?.()
    cleanupRef.current = null
    setNode(null)
    if (!enabled) return

    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const analyser = ctx.createAnalyser()
    osc.type = "sine"
    osc.frequency.value = 196
    gain.gain.value = 0.22
    osc.connect(gain)
    gain.connect(analyser)
    void ctx.resume()
    osc.start()

    setNode(analyser)
    cleanupRef.current = () => {
      osc.stop()
      void ctx.close()
    }

    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [enabled])

  return node
}

export function useMicrophoneStream(enabled: boolean) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop())
        return null
      })
      setError(null)
      return
    }

    let active = true
    setError(null)
    void navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((s) => {
        if (!active) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        setStream(s)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Microphone permission denied"
        setError(message)
        setStream(null)
      })

    return () => {
      active = false
      setStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop())
        return null
      })
    }
  }, [enabled])

  return { stream, error }
}