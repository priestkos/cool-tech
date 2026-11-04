import type { EffectHint } from "@/lib/types"
import { useEffect, useRef } from "react"

type Props = {
  enabled: boolean
  hints: EffectHint[]
  reducedMotion: boolean
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  kind: EffectHint["kind"]
  color?: string
}

export function EffectsOverlay({ enabled, hints, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !enabled || reducedMotion) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    const particles: Particle[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const spawn = () => {
      for (const hint of hints) {
        const count = Math.ceil(hint.intensity * 3)
        for (let i = 0; i < count; i++) {
          particles.push({
            x: hint.x + (Math.random() - 0.5) * 20,
            y: hint.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 0.6,
            vy: hint.kind === "steam" ? -0.8 - Math.random() : 0.4 + Math.random() * 0.5,
            life: 1,
            kind: hint.kind,
            color: hint.kind === "glow" ? hint.color : undefined,
          })
        }
      }
    }

    let frame = 0
    const tick = () => {
      frame++
      if (frame % 8 === 0) spawn()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.02
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.globalAlpha = p.life * 0.7
        if (p.kind === "steam") {
          ctx.fillStyle = "rgba(255,255,255,0.5)"
          ctx.beginPath()
          ctx.arc(p.x, p.y, 6 * p.life, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.kind === "water") {
          ctx.fillStyle = "rgba(56,189,248,0.7)"
          ctx.fillRect(p.x, p.y, 3, 8 * p.life)
        } else {
          ctx.fillStyle = p.color ?? "#fbbf24"
          ctx.beginPath()
          ctx.arc(p.x, p.y, 10 * p.life, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [enabled, hints, reducedMotion])

  if (!enabled || reducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  )
}
