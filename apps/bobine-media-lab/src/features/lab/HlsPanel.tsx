import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoPlayer } from "@/features/player/VideoPlayer"
import {
  attachHlsPlayback,
  getHlsLoadLog,
  getHlsModuleLoadedFlag,
  shouldUseHlsLoader,
} from "@/features/player/hls-loader"
import { FIXTURES } from "./fixtures"

type SourceKind = "mp4" | "hls"

export function HlsPanel() {
  const [source, setSource] = useState<SourceKind>("mp4")
  const [log, setLog] = useState(() => [...getHlsLoadLog()])
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsLoaded = getHlsModuleLoadedFlag()

  const refreshLog = useCallback(() => {
    setLog([...getHlsLoadLog()])
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const src = source === "hls" ? FIXTURES.hlsPlaylist : FIXTURES.videoMp4

    if (source === "mp4") {
      el.src = src
      el.load()
      return
    }

    if (shouldUseHlsLoader(src)) {
      void attachHlsPlayback(el, src).then(() => refreshLog())
    }
  }, [source, refreshLog])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lazy HLS panel</CardTitle>
        <CardDescription>
          hls.js is dynamically imported only when the HLS fixture is selected. MP4 uses the native
          element only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={source === "mp4" ? "default" : "outline"}
            onClick={() => setSource("mp4")}
          >
            MP4 (no hls.js)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={source === "hls" ? "default" : "outline"}
            onClick={() => setSource("hls")}
          >
            HLS (.m3u8)
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          Module loaded flag: <strong>{hlsLoaded ? "yes" : "no"}</strong>
        </p>
        <VideoPlayer
          ref={videoRef}
          src={source === "hls" ? FIXTURES.hlsPlaylist : FIXTURES.videoMp4}
          captionSrc={FIXTURES.captionsVtt}
        />
        <div className="rounded-md border border-border bg-muted/40 p-2 font-mono text-[0.65rem]">
          <p className="mb-1 font-semibold">Bundle / import log</p>
          {log.length === 0 ? (
            <p className="text-muted-foreground">No hls.js import yet — pick HLS to lazy-load.</p>
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