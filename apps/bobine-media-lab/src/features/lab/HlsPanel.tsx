import { useState } from "react"
import { VideoPlayer } from "bobinejs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FIXTURES, captionTracks } from "./fixtures"
import {
  getHlsLoadLog,
  getHlsModuleTouchedFlag,
  instrumentedHlsLoader,
  shouldUseHlsLoader,
} from "./instrumented-hls"

type SourceKind = "mp4" | "hls"

export function HlsPanel() {
  const [source, setSource] = useState<SourceKind>("mp4")
  const [logVersion, setLogVersion] = useState(0)

  const src = source === "hls" ? FIXTURES.hlsPlaylist : FIXTURES.videoMp4
  const hlsTouched = getHlsModuleTouchedFlag()
  const log = getHlsLoadLog()

  const selectSource = (kind: SourceKind) => {
    setSource(kind)
    if (kind === "hls" && shouldUseHlsLoader(FIXTURES.hlsPlaylist)) {
      setLogVersion((v) => v + 1)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lazy HLS panel</CardTitle>
        <CardDescription>
          bobinejs <code>hlsLoader</code> dynamically imports the <code>hls.js</code> peer only for
          <code>.m3u8</code> sources. MP4 uses native playback only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={source === "mp4" ? "default" : "outline"}
            onClick={() => selectSource("mp4")}
          >
            MP4 (no hls.js)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={source === "hls" ? "default" : "outline"}
            onClick={() => selectSource("hls")}
          >
            HLS (.m3u8)
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          HLS adapter invoked: <strong>{hlsTouched ? "yes" : "no"}</strong> (log refresh #{logVersion})
        </p>
        <VideoPlayer
          key={src}
          src={src}
          loader={instrumentedHlsLoader}
          tracks={captionTracks}
          preload="metadata"
          persistKey="bobine-media-lab-hls"
        />
        <div className="rounded-md border border-border bg-muted/40 p-2 font-mono text-[0.65rem]">
          <p className="mb-1 font-semibold">hlsLoader telemetry</p>
          {log.length === 0 ? (
            <p className="text-muted-foreground">No HLS load yet — pick HLS to invoke bobine hlsLoader.</p>
          ) : (
            <ul className="space-y-1">
              {log.map((entry, i) => (
                <li key={`${entry.at}-${i}`}>
                  [{entry.at}] {entry.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}