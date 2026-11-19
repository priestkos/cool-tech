import { useCallback, useRef } from "react"
import type { AxisState } from "@/lib/allo-axes"
import { AXIS_RANGES, axisStyle, buildFontVariationSettings } from "@/lib/allo-axes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { CodeBlock } from "@/components/CodeBlock"

const SAMPLE =
  "Allo variable axes tune warmth and clarity — from sharp UI labels to soft marketing display."

function sliderValue(v: number | readonly number[]): number {
  return typeof v === "number" ? v : (v[0] ?? 0)
}

type AxisPlaygroundProps = {
  axes: AxisState
  onWght: (v: number) => void
  onRond: (v: number) => void
  onOpsz: (v: number) => void
  onAutoOpsz: (v: boolean) => void
  onPad: (wght: number, rond: number) => void
}

export function AxisPlayground({
  axes,
  onWght,
  onRond,
  onOpsz,
  onAutoOpsz,
  onPad,
}: AxisPlaygroundProps) {
  const padRef = useRef<HTMLDivElement>(null)

  const pointerToAxes = useCallback(
    (clientX: number, clientY: number) => {
      const el = padRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
      const wght =
        AXIS_RANGES.wght.min + x * (AXIS_RANGES.wght.max - AXIS_RANGES.wght.min)
      const rond =
        AXIS_RANGES.ROND.max - y * (AXIS_RANGES.ROND.max - AXIS_RANGES.ROND.min)
      onPad(wght, rond)
    },
    [onPad],
  )

  const variationCss = buildFontVariationSettings(
    axes.wght,
    axes.rond,
    axes.opsz,
    axes.autoOpsz,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Axis playground</CardTitle>
        <CardDescription>
          Weight, roundness, and optical size — bundled Allo variable font only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wght-slider">Weight (wght) — {Math.round(axes.wght)}</Label>
            <Slider
              id="wght-slider"
              min={AXIS_RANGES.wght.min}
              max={AXIS_RANGES.wght.max}
              step={1}
              value={[axes.wght]}
              onValueChange={(v) => onWght(sliderValue(v))}
              aria-label="Weight axis"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rond-slider">Roundness (ROND) — {Math.round(axes.rond)}</Label>
            <Slider
              id="rond-slider"
              min={AXIS_RANGES.ROND.min}
              max={AXIS_RANGES.ROND.max}
              step={1}
              value={[axes.rond]}
              onValueChange={(v) => onRond(sliderValue(v))}
              aria-label="Roundness axis"
            />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="opsz-slider">Optical size (opsz) — {Math.round(axes.opsz)}</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-opsz" className="text-muted-foreground text-xs font-normal">
                  Auto opsz
                </Label>
                <Switch
                  id="auto-opsz"
                  checked={axes.autoOpsz}
                  onCheckedChange={onAutoOpsz}
                  aria-label="Toggle automatic optical sizing"
                />
              </div>
            </div>
            <Slider
              id="opsz-slider"
              min={AXIS_RANGES.opsz.min}
              max={AXIS_RANGES.opsz.max}
              step={1}
              value={[axes.opsz]}
              onValueChange={(v) => onOpsz(sliderValue(v))}
              disabled={axes.autoOpsz}
              aria-label="Optical size axis"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Weight × roundness pad</Label>
          <div
            ref={padRef}
            role="slider"
            tabIndex={0}
            aria-label="Drag to set weight and roundness"
            aria-valuemin={AXIS_RANGES.wght.min}
            aria-valuemax={AXIS_RANGES.wght.max}
            className="border-border bg-card relative h-40 w-full cursor-crosshair touch-none rounded-lg border"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              pointerToAxes(e.clientX, e.clientY)
            }}
            onPointerMove={(e) => {
              if (e.buttons !== 1) return
              pointerToAxes(e.clientX, e.clientY)
            }}
          >
            <span
              className="bg-primary ring-background pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
              style={{
                left: `${((axes.wght - AXIS_RANGES.wght.min) / (AXIS_RANGES.wght.max - AXIS_RANGES.wght.min)) * 100}%`,
                top: `${(1 - (axes.rond - AXIS_RANGES.ROND.min) / (AXIS_RANGES.ROND.max - AXIS_RANGES.ROND.min)) * 100}%`,
              }}
            />
            <span className="text-muted-foreground pointer-events-none absolute bottom-2 left-2 text-[10px]">
              wght {Math.round(axes.wght)}
            </span>
            <span className="text-muted-foreground pointer-events-none absolute right-2 top-2 text-[10px]">
              ROND {Math.round(axes.rond)}
            </span>
          </div>
        </div>

        <p
          className="text-xl leading-snug sm:text-2xl"
          style={axisStyle(axes)}
        >
          {SAMPLE}
        </p>

        <CodeBlock code={`font-variation-settings: ${variationCss};`} label="Copy variation settings" />
      </CardContent>
    </Card>
  )
}