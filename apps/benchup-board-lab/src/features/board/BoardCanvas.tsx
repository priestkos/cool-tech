import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { createBoardScene } from "./scene"
import type { Board } from "./model"
import type { ToolMode } from "./model"

type Props = {
  boards: Board[]
  selectedId: string | null
  tool: ToolMode
  previewLength: number | null
  previewWidth: number | null
  onPlace: (x: number, z: number) => void
  onMove: (x: number, z: number) => void
  onSelect: (id: string | null) => void
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  } catch {
    return false
  }
}

export function BoardCanvas({
  boards,
  selectedId,
  tool,
  previewLength,
  previewWidth,
  onPlace,
  onMove,
  onSelect,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<ReturnType<typeof createBoardScene> | null>(null)
  const [webglOk] = useState(detectWebGL)
  const hoverRef = useRef({ x: 0, z: 0 })

  useEffect(() => {
    if (!webglOk || !canvasRef.current) return
    const handle = createBoardScene(canvasRef.current, () => {})
    sceneRef.current = handle
    return () => {
      handle.dispose()
      sceneRef.current = null
    }
  }, [webglOk])

  useEffect(() => {
    sceneRef.current?.update({
      boards,
      selectedId,
      preview:
        previewLength && previewWidth
          ? {
              length: previewLength,
              width: previewWidth,
              originX: hoverRef.current.x,
              originZ: hoverRef.current.z,
            }
          : null,
    })
  }, [boards, selectedId, previewLength, previewWidth])

  if (!webglOk) {
    return (
      <div
        className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center"
        role="region"
        aria-label="3D board view unavailable"
      >
        <Badge variant="outline">WebGL unavailable</Badge>
        <p className="max-w-sm text-sm text-muted-foreground">
          BenchUp Board Lab needs WebGL for the grid and boards. Cut-list math and
          JSON still work offline in the side panel.
        </p>
      </div>
    )
  }

  const handlePointer = (clientX: number, clientY: number) => {
    const hit = sceneRef.current?.pickGround(clientX, clientY)
    if (hit) hoverRef.current = hit
    sceneRef.current?.update({
      boards,
      selectedId,
      preview:
        tool === "place" && previewLength && previewWidth
          ? {
              length: previewLength,
              width: previewWidth,
              originX: hoverRef.current.x,
              originZ: hoverRef.current.z,
            }
          : null,
    })
  }

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-xl border border-border bg-[#dfe8df] shadow-inner">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        aria-label="Board grid. Click to place or move lumber with edge snap."
        onPointerMove={(e) => handlePointer(e.clientX, e.clientY)}
        onPointerDown={(e) => {
          const scene = sceneRef.current
          if (!scene) return
          if (tool === "pushpull" || tool === "move") {
            const id = scene.pickBoard(e.clientX, e.clientY)
            if (id) {
              onSelect(id)
              return
            }
          }
          const ground = scene.pickGround(e.clientX, e.clientY)
          if (!ground) return
          if (tool === "place") onPlace(ground.x, ground.z)
          else if (tool === "move") onMove(ground.x, ground.z)
        }}
      />
      <p className="pointer-events-none absolute bottom-2 left-2 max-w-[90%] rounded bg-background/85 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
        Drag to orbit · scroll to zoom · grid = 1 in
      </p>
    </div>
  )
}
