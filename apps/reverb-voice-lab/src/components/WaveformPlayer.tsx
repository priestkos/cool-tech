import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { downloadBlob, encodeWav } from "@/lib/wav"

type Props = {
  samples: Float32Array
  sampleRate: number
  label?: string
}

export function WaveformPlayer({ samples, sampleRate, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playing, setPlaying] = useState(false)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const mid = height / 2
    const step = Math.ceil(samples.length / width)
    ctx.strokeStyle = "oklch(0.45 0.06 275)"
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x < width; x++) {
      const start = x * step
      let min = 0
      let max = 0
      for (let i = start; i < start + step && i < samples.length; i++) {
        const v = samples[i]!
        if (v < min) min = v
        if (v > max) max = v
      }
      ctx.moveTo(x, mid + min * mid * 0.95)
      ctx.lineTo(x, mid + max * mid * 0.95)
    }
    ctx.stroke()
  }, [samples])

  const stopPlayback = useCallback(() => {
    sourceRef.current?.stop()
    sourceRef.current = null
    setPlaying(false)
  }, [])

  const play = useCallback(async () => {
    stopPlayback()
    const ctx = ctxRef.current ?? new AudioContext()
    ctxRef.current = ctx
    if (ctx.state === "suspended") await ctx.resume()
    const buffer = ctx.createBuffer(1, samples.length, sampleRate)
    buffer.copyToChannel(new Float32Array(samples), 0)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(ctx.destination)
    src.onended = () => setPlaying(false)
    sourceRef.current = src
    setPlaying(true)
    src.start()
  }, [sampleRate, samples, stopPlayback])

  useEffect(() => () => stopPlayback(), [stopPlayback])

  const download = () => {
    const blob = encodeWav(samples, sampleRate)
    downloadBlob(blob, `${label ?? "reverb-output"}.wav`)
  }

  const seconds = samples.length / sampleRate

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        className="h-20 w-full rounded-md border border-border bg-muted/30"
        aria-label="Waveform"
      />
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{seconds.toFixed(2)} s · {sampleRate} Hz</span>
        <Button type="button" size="sm" variant="secondary" onClick={() => void play()} disabled={playing}>
          {playing ? "Playing…" : "Play"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={stopPlayback} disabled={!playing}>
          Stop
        </Button>
        <Button type="button" size="sm" onClick={download}>
          Download WAV
        </Button>
      </div>
    </div>
  )
}