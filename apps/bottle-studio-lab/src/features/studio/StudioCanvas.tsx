import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { createStudioScene, type StudioSceneHandle } from "./scene"
import type { StudioState } from "./state"

type Props = {
  state: StudioState
  resetCameraToken: number
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl")
    )
  } catch {
    return false
  }
}

export function StudioCanvas({ state, resetCameraToken }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<StudioSceneHandle | null>(null)
  const [webglOk] = useState(detectWebGL)

  useEffect(() => {
    if (!webglOk || !canvasRef.current) return
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const handle = createStudioScene(canvasRef.current, state, reducedMotion)
    sceneRef.current = handle
    return () => {
      handle.dispose()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, [webglOk])

  useEffect(() => {
    sceneRef.current?.update(state)
  }, [state])

  useEffect(() => {
    sceneRef.current?.resetCamera()
  }, [resetCameraToken])

  if (!webglOk) {
    return (
      <div
        className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center"
        role="region"
        aria-label="3D preview unavailable"
      >
        <Badge variant="outline">WebGL unavailable</Badge>
        <p className="max-w-sm text-sm text-muted-foreground">
          This studio needs WebGL for the 3D bottle preview. Try a desktop browser
          with hardware acceleration enabled, or adjust controls—the numeric
          values still update for when WebGL is available.
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-xl border border-border bg-[#ebe4d8] shadow-inner">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        aria-label="Interactive 3D bottle preview. Drag to orbit."
      />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
        Drag to orbit · scroll to zoom
      </p>
    </div>
  )
}
