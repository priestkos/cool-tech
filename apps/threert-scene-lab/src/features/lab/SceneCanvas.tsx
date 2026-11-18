import { useEffect, useRef } from "react"
import type { BuiltThreertScene } from "@/features/scene/build"
import type { SceneDocument } from "@/features/scene/document"
import {
  createScenePreview,
  type PreviewHandle,
} from "@/features/scene/three-preview"

type Props = {
  doc: SceneDocument
  built: BuiltThreertScene
}

export function SceneCanvas({ doc, built }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handleRef = useRef<PreviewHandle | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handle = createScenePreview(canvas)
    handleRef.current = handle
    handle.load(doc, built)
    return () => {
      handle.dispose()
      handleRef.current = null
    }
  }, [])

  useEffect(() => {
    handleRef.current?.load(doc, built)
  }, [doc, built])

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-xl border border-border bg-muted/40">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        aria-label="Live three.js raster preview of @threert/scene graph"
      />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
        Scene: @threert/scene 0.1.1 · Preview: three.js raster (not path tracing)
      </p>
    </div>
  )
}