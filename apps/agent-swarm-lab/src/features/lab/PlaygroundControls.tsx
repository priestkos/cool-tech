import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { TriggerMode } from "@/features/swarm/types"
import { cn } from "@/lib/utils"

type Props = {
  speed: number
  onSpeedChange: (v: number) => void
  themeDark: boolean
  onThemeChange: (dark: boolean) => void
  trigger: TriggerMode
  onTriggerChange: (mode: TriggerMode) => void
  showLabels: boolean
  onShowLabelsChange: (v: boolean) => void
  motionEnabled: boolean
  onMotionChange: (v: boolean) => void
  onReplay: () => void
  onManualRun: () => void
  highlightSupported: boolean
}

export function PlaygroundControls({
  speed,
  onSpeedChange,
  themeDark,
  onThemeChange,
  trigger,
  onTriggerChange,
  showLabels,
  onShowLabelsChange,
  motionEnabled,
  onMotionChange,
  onReplay,
  onManualRun,
  highlightSupported,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab controls</CardTitle>
        <CardDescription>
          Speed, theme, trigger, labels, replay, and reduced-motion override.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="speed">Speed ({speed.toFixed(1)}×)</Label>
          <input
            id="speed"
            type="range"
            min={0.5}
            max={2.5}
            step={0.1}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="accent-primary w-full"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="theme">Dark theme</Label>
          <Switch
            id="theme"
            checked={themeDark}
            onCheckedChange={onThemeChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trigger">Trigger mode</Label>
          <select
            id="trigger"
            value={trigger}
            onChange={(e) => onTriggerChange(e.target.value as TriggerMode)}
            className={cn(
              "border-input bg-background h-9 w-full rounded-md border px-3 text-sm",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            )}
          >
            <option value="visible">When visible (default)</option>
            <option value="mount">On mount</option>
            <option value="manual">Manual only</option>
          </select>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="labels">Agent labels</Label>
          <Switch
            id="labels"
            checked={showLabels}
            onCheckedChange={onShowLabelsChange}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="motion">Motion enabled</Label>
          <Switch
            id="motion"
            checked={motionEnabled}
            onCheckedChange={onMotionChange}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onReplay}>
            Replay swarm
          </Button>
          <Button type="button" variant="outline" onClick={onManualRun}>
            Run (manual)
          </Button>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          CSS Custom Highlight API:{" "}
          <span className="text-foreground font-medium">
            {highlightSupported ? "supported" : "unavailable — text shows normally"}
          </span>
          . Requires Chromium 105+, Safari 17.2+, Firefox 136+.
        </p>
      </CardContent>
    </Card>
  )
}
