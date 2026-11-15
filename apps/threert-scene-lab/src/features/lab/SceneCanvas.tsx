import { useEffect, useRef } from "react"
import type { SceneLabFile } from "@/features/scene/schema"
import { createScenePreview, type PreviewHandle } from "@/features/scene/preview"

type Props = {
  scene: SceneLabFile
}

export function SceneCanvas({ scene }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handleRef = useRef<PreviewHandle | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handle = createScenePreview(canvas)
    handleRef.current = handle
    handle.loadScene(scene)
    return () => {
      handle.dispose()
      handleRef.current = null
    }
  }, [])

  useEffect(() => {
    handleRef.current?.loadScene(scene)
  }, [scene])

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-xl border border-border bg-muted/40">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        aria-label="Live three.js scene preview"
      />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
        Browser path: rasterized three.js · shadows on · not native path tracing
      </p>
    </div>
  )
}