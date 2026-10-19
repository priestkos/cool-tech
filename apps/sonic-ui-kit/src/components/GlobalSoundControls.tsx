import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useSoundContext } from "@/context/SoundProvider"

export function GlobalSoundControls() {
  const {
    settings,
    showReducedBadge,
    prefersReducedMotion,
    setVolume,
    setMuted,
    setReducedMotionOverride,
  } = useSoundContext()

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Switch
          id="global-mute"
          checked={settings.muted}
          onCheckedChange={setMuted}
        />
        <Label htmlFor="global-mute">Mute all sounds</Label>
      </div>
      <div className="flex min-w-[200px] flex-1 items-center gap-3">
        <Label className="shrink-0">Volume</Label>
        <Slider
          value={[Math.round(settings.volume * 100)]}
          min={0}
          max={100}
          step={1}
          onValueChange={(v) => {
            const n = Array.isArray(v) ? v[0] : v
            setVolume((n ?? 0) / 100)
          }}
          disabled={settings.muted}
        />
        <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">
          {Math.round(settings.volume * 100)}%
        </span>
      </div>
      {showReducedBadge && (
        <Badge variant="secondary">Reduced motion — quieter by default</Badge>
      )}
      {prefersReducedMotion && (
        <div className="flex items-center gap-2">
          <Switch
            id="reduced-override"
            checked={settings.reducedMotionOverride === false}
            onCheckedChange={(on) =>
              setReducedMotionOverride(on ? false : null)
            }
          />
          <Label htmlFor="reduced-override" className="text-sm">
            Full volume despite reduced motion
          </Label>
        </div>
      )}
    </div>
  )
}
