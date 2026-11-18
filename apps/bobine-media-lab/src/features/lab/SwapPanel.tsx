import { useState } from "react"
import { VideoPlayer } from "bobinejs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { captionTracks, SHARED_VIDEO_PROPS } from "./fixtures"

export function SwapPanel() {
  const [useBobine, setUseBobine] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Native vs bobine swap</CardTitle>
        <CardDescription>
          Same local clip and caption track — toggle between the browser&apos;s native controls and the
          official bobinejs player.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SwapPlayerLabel checked={useBobine} onCheckedChange={setUseBobine} />
        {useBobine ? (
          <VideoPlayer
            {...SHARED_VIDEO_PROPS}
            tracks={captionTracks}
            data-testid="bobine-player"
            persistKey="bobine-media-lab-swap"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <video
              className="aspect-video w-full bg-black"
              controls
              data-testid="native-player"
              {...SHARED_VIDEO_PROPS}
            >
              {captionTracks.map((track) => (
                <track
                  key={track.src}
                  kind={track.kind ?? "subtitles"}
                  src={track.src}
                  srcLang={track.srcLang}
                  label={track.label}
                  default={track.default}
                />
              ))}
            </video>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SwapPlayerLabel({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div>
        <Label htmlFor="swap-toggle" className="text-xs font-medium">
          Use bobinejs player
        </Label>
        <p className="text-muted-foreground text-[0.65rem]">
          Off shows native <code>&lt;video&gt;</code> with browser controls
        </p>
      </div>
      <Switch id="swap-toggle" checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}