import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  label: string
  onApply: (value: {
    inputMethod: "typed" | "drawn"
    value?: string
    imageDataUrl?: string
  }) => void
}

export function SignaturePad({ label, onApply }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<"typed" | "drawn">("drawn")
  const [typed, setTyped] = useState("")
  const drawing = useRef(false)

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  function pointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    drawing.current = true
    canvas.setPointerCapture(event.pointerId)
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }
    const rect = canvas.getBoundingClientRect()
    ctx.strokeStyle = "#111"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top)
  }

  function pointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) {
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) {
      return
    }
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top)
    ctx.stroke()
  }

  function pointerUp() {
    drawing.current = false
  }

  function apply() {
    if (mode === "typed") {
      if (!typed.trim()) {
        return
      }
      onApply({ inputMethod: "typed", value: typed.trim() })
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    onApply({ inputMethod: "drawn", imageDataUrl: canvas.toDataURL("image/png") })
  }

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "drawn" ? "default" : "outline"}
            onClick={() => setMode("drawn")}
          >
            Draw
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "typed" ? "default" : "outline"}
            onClick={() => setMode("typed")}
          >
            Type
          </Button>
        </div>
      </div>
      {mode === "typed" ? (
        <Input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Type signature"
          aria-label="Typed signature"
        />
      ) : (
        <canvas
          ref={(node) => {
            canvasRef.current = node
            if (node && node.width === 0) {
              node.width = 320
              node.height = 96
              clearCanvas()
            }
          }}
          className="w-full touch-none rounded border bg-white"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerLeave={pointerUp}
          aria-label="Draw signature"
        />
      )}
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={clearCanvas}>
          Clear
        </Button>
        <Button type="button" size="sm" onClick={apply}>
          Apply
        </Button>
      </div>
    </div>
  )
}