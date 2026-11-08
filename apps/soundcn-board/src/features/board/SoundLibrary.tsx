import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePresetPlayer } from "./usePresetPlayer"
import { PRESET_IDS, type PresetId } from "@/lib/soundcn/presets"
import { formatPresetLabel } from "./board-model"
import { cn } from "@/lib/utils"

type Props = {
  soundEnabled: boolean
  volume: number
  lastPlayed: PresetId | null
  onPreview: (presetId: PresetId) => void
  motionOn: boolean
}

function SoundCard({
  presetId,
  soundEnabled,
  volume,
  isLast,
  motionOn,
  onPreview,
}: {
  presetId: PresetId
  soundEnabled: boolean
  volume: number
  isLast: boolean
  motionOn: boolean
  onPreview: (presetId: PresetId) => void
}) {
  const { play, asset, isPlaying } = usePresetPlayer(
    presetId,
    soundEnabled,
    volume,
    () => onPreview(presetId),
  )

  return (
    <Card
      className={cn(
        "sound-last-played",
        isLast && motionOn && "sound-last-played-active border-ring/60",
        isLast && !motionOn && "sound-last-played-active border-ring",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm capitalize">
            {formatPresetLabel(presetId)}
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {asset.license}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          {asset.author} · ~{(asset.duration * 1000).toFixed(0)}ms meta
        </p>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={() => play()}
          aria-pressed={isPlaying}
        >
          Preview (click)
        </Button>
      </CardContent>
    </Card>
  )
}

export function SoundLibrary({
  soundEnabled,
  volume,
  lastPlayed,
  onPreview,
  motionOn,
}: Props) {
  return (
    <section aria-labelledby="library-heading">
      <h2 id="library-heading" className="mb-3 text-sm font-semibold tracking-tight">
        Sound library
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {PRESET_IDS.map((id) => (
          <SoundCard
            key={id}
            presetId={id}
            soundEnabled={soundEnabled}
            volume={volume}
            isLast={lastPlayed === id}
            motionOn={motionOn}
            onPreview={onPreview}
          />
        ))}
      </div>
    </section>
  )
}
