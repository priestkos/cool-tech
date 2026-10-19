import { Volume2, VolumeX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useSoundKit } from '@/context/sound-provider'

export function GlobalSoundControls() {
  const {
    settings,
    reducedMotionActive,
    setMuted,
    setVolume,
    setReducedMotionOverride,
  } = useSoundKit()

  const showingReducedBadge =
    reducedMotionActive && settings.reducedMotionOverride === null

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-left">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-medium">Global sound</h2>
        {showingReducedBadge ? (
          <Badge variant="secondary">Reduced motion — sounds muted by default</Badge>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="mute"
            checked={settings.muted}
            onCheckedChange={checked => {
              setReducedMotionOverride(true)
              setMuted(checked)
            }}
          />
          <Label htmlFor="mute" className="flex items-center gap-1.5">
            {settings.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            Mute
          </Label>
        </div>
        <div className="flex min-w-[200px] flex-1 flex-col gap-2">
          <Label>Volume</Label>
          <Slider
            value={[settings.volume * 100]}
            max={100}
            step={1}
            disabled={settings.muted}
            onValueChange={value => {
              const v = Array.isArray(value) ? value[0] : value
              setReducedMotionOverride(true)
              setVolume(v / 100)
            }}
          />
        </div>
      </div>
      {reducedMotionActive ? (
        <p className="text-xs text-muted-foreground">
          Your system prefers reduced motion. Override mute/volume above to hear sounds anyway.
        </p>
      ) : null}
    </section>
  )
}
