import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  unlocked: boolean
  muted: boolean
  volume: number
  soundEnabled: boolean
  onMutedChange: (muted: boolean) => void
  onVolumeChange: (volume: number) => void
  onReset: () => void
}

export function MasterControls({
  unlocked,
  muted,
  volume,
  soundEnabled,
  onMutedChange,
  onVolumeChange,
  onReset,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Master audio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="master-mute" className="flex flex-col gap-0.5">
            <span>Mute all sounds</span>
            <span className="text-muted-foreground text-xs font-normal">
              Stops any sound currently playing
            </span>
          </Label>
          <Switch
            id="master-mute"
            checked={muted}
            onCheckedChange={onMutedChange}
            disabled={!unlocked}
            aria-describedby="master-mute-hint"
          />
        </div>
        <p id="master-mute-hint" className="sr-only">
          When enabled, UI actions update visuals but no audio plays.
        </p>

        <div className="space-y-2">
          <Label htmlFor="master-volume">Volume ({Math.round(volume * 100)}%)</Label>
          <input
            id="master-volume"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            disabled={!unlocked || muted}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            className="accent-primary w-full"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
          />
        </div>

        <p
          className="text-muted-foreground text-xs"
          role="status"
          aria-live="polite"
        >
          {unlocked
            ? soundEnabled
              ? "Sounds will play on button, toggle, and notification actions."
              : "Muted — actions are silent until you unmute."
            : "Enable sound first to unlock the audio context."}
        </p>

        <Button type="button" variant="outline" onClick={onReset} className="w-full">
          Reset board
        </Button>
      </CardContent>
    </Card>
  )
}
