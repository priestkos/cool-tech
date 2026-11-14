import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { VideoPlayer } from "@/features/player/VideoPlayer"
import { FIXTURES, SHARED_VIDEO_PROPS } from "./fixtures"

export function SwapPanel({ onToggleHelp }: { onToggleHelp?: () => void }) {
  const [useCleanRoom, setUseCleanRoom] = useState(true)

  const shared = {
    ...SHARED_VIDEO_PROPS,
    captionSrc: FIXTURES.captionsVtt,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Native vs clean-room swap</CardTitle>
        <CardDescription>
          Same local clip and the same props on both players — toggle custom chrome without changing
          the media contract.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SwapPlayerLabel checked={useCleanRoom} onCheckedChange={setUseCleanRoom} />
        {useCleanRoom ? (
          <VideoPlayer {...shared} onToggleHelp={onToggleHelp} data-testid="clean-room-player" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <video
              className="aspect-video w-full bg-black"
              controls
              playsInline
              data-testid="native-player"
              {...shared}
            >
              <track kind="captions" src={FIXTURES.captionsVtt} srcLang="en" label="English" />
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
          Use clean-room player
        </Label>
        <p className="text-muted-foreground text-[0.65rem]">
          Off shows the native <code>&lt;video&gt;</code> with browser controls
        </p>
      </div>
      <Switch id="swap-toggle" checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}