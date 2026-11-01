import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { CameraControlsMode } from "@sparkjsdev/radix"
import { cn } from "@/lib/utils"

interface ControlsPanelProps {
  mode: CameraControlsMode
  onModeChange: (mode: CameraControlsMode) => void
  flipY: boolean
  onFlipYChange: (flip: boolean) => void
  onResetView: () => void
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      className="flex-1"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export function ControlsPanel({
  mode,
  onModeChange,
  flipY,
  onFlipYChange,
  onResetView,
}: ControlsPanelProps) {
  return (
    <Card className="pointer-events-auto border-border/60 bg-background/90 shadow-lg backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Navigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="space-y-1.5">
          <Label>Mode</Label>
          <div className="flex gap-2">
            <ModeButton active={mode === "orbit"} onClick={() => onModeChange("orbit")}>
              Orbit
            </ModeButton>
            <ModeButton active={mode === "fly"} onClick={() => onModeChange("fly")}>
              Fly
            </ModeButton>
          </div>
        </div>
        <div className="flex gap-2">
          <ModeButton active={!flipY} onClick={() => onFlipYChange(false)}>
            Normal
          </ModeButton>
          <ModeButton active={flipY} onClick={() => onFlipYChange(true)}>
            Flip Y
          </ModeButton>
        </div>
        <Button type="button" variant="secondary" size="sm" className={cn("w-full")} onClick={onResetView}>
          Reset view
        </Button>
        <div className="space-y-1 text-muted-foreground">
          <p className="font-medium text-foreground">Mouse</p>
          <p>Orbit: drag to orbit, scroll to zoom, right-drag to pan.</p>
          <p>Fly: drag to look, WASD to move, Shift/Ctrl for fast/slow.</p>
          <p className="pt-1 font-medium text-foreground">Keys</p>
          <p>Press the mode key (default Tab) to toggle orbit/fly.</p>
        </div>
      </CardContent>
    </Card>
  )
}
