import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { LabState } from "./types"

type Props = {
  state: LabState
  busy: boolean
  frameUrl: string | null
  liveViewerUrl: string | null
  onViewerMode: (mode: "view-only" | "take-control") => void
}

export function ViewerPanel({ state, busy, frameUrl, liveViewerUrl, onViewerMode }: Props) {
  const takeControl = state.viewerMode === "take-control"
  const panelBlocksViewer = state.controlHolder === "panel"

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Embedded viewer</CardTitle>
        <CardDescription>
          Live H.264 WebCodecs viewer when an engine is up; PNG frame stream in mock mode. Only one
          controller sends input at a time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="viewer-control"
              checked={takeControl}
              disabled={busy || state.mode === "disconnected" || panelBlocksViewer}
              onCheckedChange={(checked) =>
                onViewerMode(checked ? "take-control" : "view-only")
              }
            />
            <Label htmlFor="viewer-control">Take control (viewer)</Label>
          </div>
          {panelBlocksViewer ? (
            <Badge variant="outline">View-only (panel holds control)</Badge>
          ) : takeControl ? (
            <Badge>Viewer controlling</Badge>
          ) : (
            <Badge variant="secondary">View-only</Badge>
          )}
        </div>
        <div
          className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black"
          aria-label="Remote desktop preview"
        >
          {state.mode === "live" && liveViewerUrl ? (
            <iframe
              title="screen-relay live viewer"
              src={liveViewerUrl}
              className="h-full w-full border-0"
              style={{ pointerEvents: takeControl && !panelBlocksViewer ? "auto" : "none" }}
            />
          ) : frameUrl ? (
            <img
              src={frameUrl}
              alt="Mock desktop frame from SDK screenshot()"
              className="h-full w-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              Connect to preview
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}