// Ported from glass-icon-reveal (MIT) — https://github.com/zanwei/glass-icon-reveal

import { useEffect, useRef, useState } from 'react'
import type { GlassParams } from '@/glass/settings'
import { PRESETS } from '@/glass/presets'
import { createRenderer, isWebGL2Available } from '@/glass/renderer'
import type { LogoTextures } from '@/glass/sdf'
import { frameAt } from '@/glass/timeline'
import { StaticGlassFallback } from '@/components/StaticGlassFallback'

export interface GlassLogoRevealProps {
  logo: LogoTextures | null
  params: GlassParams
  time: number
  onReplay?: () => void
  onRendererKind?: (kind: 'webgl2' | 'static') => void
  className?: string
}

export function GlassLogoReveal({
  logo,
  params,
  time,
  onReplay,
  onRendererKind,
  className,
}: GlassLogoRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<ReturnType<typeof createRenderer>>(null)
  const [rendererReady, setRendererReady] = useState(false)
  const webglOk = isWebGL2Available()
  const preset = PRESETS[params.presetId]

  useEffect(() => {
    if (!webglOk || !canvasRef.current) return
    let renderer: ReturnType<typeof createRenderer> = null
    try {
      renderer = createRenderer(canvasRef.current, { preserve: true })
    } catch {
      renderer = null
    }
    rendererRef.current = renderer
    const ready = renderer !== null
    setRendererReady(ready)
    onRendererKind?.(ready ? 'webgl2' : 'static')
    return () => {
      renderer?.dispose()
      rendererRef.current = null
      setRendererReady(false)
    }
  }, [webglOk, onRendererKind])

  useEffect(() => {
    if (!logo || !rendererRef.current) return
    rendererRef.current.setLogo(logo)
  }, [logo])

  useEffect(() => {
    if (!rendererReady || !logo || !rendererRef.current || !canvasRef.current) return
    const canvas = canvasRef.current

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const w = Math.max(1, Math.floor(rect.width * dpr))
      const h = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      const frame = frameAt(time, params, preset)
      rendererRef.current?.render(frame, w, h, params.tileSize)
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [rendererReady, logo, params, preset, time])

  if (!webglOk || !rendererReady) {
    return (
      <StaticGlassFallback
        logo={logo}
        background={params.background}
        className={className}
        onDoubleClick={onReplay}
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ background: params.background }}
      onDoubleClick={onReplay}
      aria-label="Glass logo reveal stage"
    />
  )
}
