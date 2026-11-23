import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Pause, Play } from "lucide-react"
import type { ClipId } from "./clips"
import { CLIPS } from "./clips"
import { useAsogPlayerContext } from "./AsogPlayerContext"

type Props = {
  clipId: ClipId
  onClipChange: (id: ClipId) => void
}

const fmt = (t: number) => t.toFixed(2)

export function LabControls({ clipId, onClipChange }: Props) {
  const lab = useAsogPlayerContext()
  const duration = lab.stats?.duration ?? 0

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Clip</CardTitle>
          <CardDescription>Local Rubloff flip-book samples from the pinned test-data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(Object.keys(CLIPS) as ClipId[]).map((id) => (
            <Button
              key={id}
              type="button"
              variant={clipId === id ? "default" : "outline"}
              size="sm"
              onClick={() => onClipChange(id)}
            >
              {CLIPS[id].label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transport</CardTitle>
          <CardDescription>Shared playback clock wired to AsogThreePlayer getTime.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={lab.togglePlay}
              disabled={lab.phase !== "ready"}
              aria-label={lab.playing ? "Pause" : "Play"}
            >
              {lab.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {lab.playing ? "Pause" : "Play"}
            </Button>
            <span className="text-muted-foreground text-xs tabular-nums">
              {fmt(lab.scrubTime)} / {fmt(duration)} s
            </span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scrub">Scrub timeline</Label>
            <input
              id="scrub"
              type="range"
              min={0}
              max={duration || 1}
              step={0.01}
              value={lab.scrubTime}
              disabled={lab.phase !== "ready"}
              className="accent-primary w-full"
              onPointerDown={() => lab.setScrubbing(true)}
              onPointerUp={() => lab.setScrubbing(false)}
              onChange={(e) => lab.seek(Number(e.target.value))}
            />
          </div>
          <div className="text-muted-foreground text-xs">
            {lab.stats?.hasAudio ? (
              <Button type="button" size="sm" variant="outline" onClick={() => void lab.toggleSound()}>
                {lab.soundEnabled ? "Mute" : "Enable sound"}
              </Button>
            ) : (
              <p>
                No soundtrack in this clip (<code className="text-[0.65rem]">hasAudio</code> is false). Bundled
                Rubloff samples at the pin are silent.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Decode stats</CardTitle>
          <CardDescription>Values from the real player after load — not README guesses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {lab.stats ? (
            <ul className="space-y-1.5 font-mono text-xs">
              <li>
                <span className="text-muted-foreground">Splats:</span>{" "}
                {lab.stats.numSplats.toLocaleString("en")}
              </li>
              <li>
                <span className="text-muted-foreground">Visible:</span>{" "}
                {lab.stats.numVisible.toLocaleString("en")}
              </li>
              <li>
                <span className="text-muted-foreground">File:</span>{" "}
                {(lab.stats.fileBytes / 1e6).toFixed(2)} MB ({lab.stats.fileBytes.toLocaleString()} B)
              </li>
              <li>
                <span className="text-muted-foreground">Load:</span> {Math.round(lab.stats.loadMs)} ms
              </li>
              <li>
                <span className="text-muted-foreground">Decode:</span> {Math.round(lab.stats.decodeMs)} ms
              </li>
              <li>
                <span className="text-muted-foreground">FPS:</span> {lab.stats.fps}
              </li>
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs">Stats appear after the clip finishes decoding.</p>
          )}
          <Badge variant="outline" className="mt-2">
            three.js 0.187 · WebGL 2
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}