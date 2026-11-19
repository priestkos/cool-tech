import { exportCrop } from "@zriz/core/dom"
import type { Cropper as CropperApi, CommitDetails, CropValue, ChangeReason } from "@zriz/react"
import { CropperContext } from "@zriz/react"
import * as Cropper from "@zriz/react/cropper"
import {
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
} from "lucide-react"
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  ASPECT_PRESETS,
  type AspectPresetId,
  presetById,
  zrizAspectValue,
} from "./aspectPresets"
import { LiveGeometryReadout } from "./LiveGeometryReadout"
import "./zriz-lab.css"

const cornerHandles = [
  "top-left",
  "top-right",
  "bottom-right",
  "bottom-left",
] as const

const zoomTrack = {
  width: "100%",
  maxWidth: 280,
  height: 28,
  backgroundImage: "linear-gradient(currentColor, currentColor)",
  backgroundSize: "100% 2px",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}

const zoomThumb = {
  top: 5,
  width: 18,
  height: 18,
  borderRadius: 9,
  background: "currentColor",
  translate: "-50%",
}

const spoken: Partial<Record<ChangeReason, string>> = {
  "rotate-90": "Turned 90 degrees",
  flip: "Flipped",
  orientation: "Orientation swapped",
  reset: "Crop reset",
}

const announce = (_: CropValue, details: CommitDetails) =>
  spoken[details.reason] ?? null

const instructions = [
  "Drag the photo to move it.",
  "Drag crop corners to resize (pinch or scroll to zoom).",
  "Use the straighten dial, rotate, and flip controls.",
].join(" ")

export type ExportFormat = "image/png" | "image/jpeg"

type Props = {
  src: string | File | null
  presetId: AspectPresetId
  landscape: boolean
  onPresetId: (id: AspectPresetId) => void
  onLandscape: (next: boolean) => void
  onReadyChange?: (ready: boolean) => void
  onPreviewBlob?: (blob: Blob | null) => void
  actionsRef?: RefObject<CropperApi | null>
}

function CropperReadout() {
  const cropper = useContext(CropperContext)
  if (!cropper) return null
  return <LiveGeometryReadout cropper={cropper} />
}

export function CropStudioEditor({
  src,
  presetId,
  landscape,
  onPresetId,
  onLandscape,
  onReadyChange,
  onPreviewBlob,
  actionsRef: externalActionsRef,
}: Props) {
  const internalActions = useRef<CropperApi | null>(null)
  const actionsRef = externalActionsRef ?? internalActions
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const previewRunning = useRef<AbortController | null>(null)

  const preset = presetById(presetId)
  const aspect = zrizAspectValue(preset, landscape)
  const srcKey =
    typeof src === "string" ? src : src instanceof File ? `${src.name}-${src.size}` : "empty"

  const renderPreview = useCallback(async () => {
    const cropper = actionsRef.current
    if (!cropper || !ready) return
    previewRunning.current?.abort()
    const controller = new AbortController()
    previewRunning.current = controller
    try {
      const result = await exportCrop(cropper, {
        type: "image/png",
        signal: controller.signal,
        shape: preset.shape,
      })
      onPreviewBlob?.(result.blob)
    } catch {
      if (!controller.signal.aborted) onPreviewBlob?.(null)
    } finally {
      if (previewRunning.current === controller) previewRunning.current = null
    }
  }, [actionsRef, onPreviewBlob, preset.shape, ready])

  useEffect(() => () => previewRunning.current?.abort(), [srcKey])

  useEffect(() => {
    setReady(false)
    setLoadError(false)
    onReadyChange?.(false)
  }, [srcKey, onReadyChange])

  return (
    <div className="space-y-4">
      <Cropper.Root
        key={srcKey}
        actionsRef={actionsRef}
        src={src ?? undefined}
        shape={preset.shape}
        aspect={aspect}
        previewEdge={720}
        onLoad={() => {
          setReady(true)
          setLoadError(false)
          onReadyChange?.(true)
          void renderPreview()
        }}
        onError={() => {
          setLoadError(true)
          setReady(false)
          onReadyChange?.(false)
        }}
        onValueCommit={() => {
          void renderPreview()
        }}
      >
        <Cropper.Viewport
          className="mx-auto w-full"
          style={{ maxWidth: 720, height: "min(52vh, 480px)", padding: 20 }}
        >
          <Cropper.Image />
          <Cropper.Mask />
          <Cropper.Area aria-label="Crop area">
            <Cropper.Grid />
            {cornerHandles.map((position) => (
              <Cropper.Handle key={position} position={position} />
            ))}
          </Cropper.Area>
        </Cropper.Viewport>

        <div className="zriz-toolbar mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Cropper.DialValue
              className="text-muted-foreground min-w-[3.5rem] text-sm tabular-nums"
              format={(degrees) =>
                `${Math.sign(degrees) * Math.round(Math.abs(degrees))}°`
              }
            />
            <Cropper.Dial aria-label="Straighten" style={{ flex: 1, maxWidth: 361 }}>
              <Cropper.DialTicks />
            </Cropper.Dial>
          </div>

          <div>
            <Label className="mb-2 block text-xs text-muted-foreground">Zoom</Label>
            <Cropper.Zoom aria-label="Zoom" style={zoomTrack}>
              <Cropper.ZoomThumb style={zoomThumb} />
            </Cropper.Zoom>
          </div>

          <div>
            <Label className="mb-2 block text-xs text-muted-foreground">Aspect presets</Label>
            <aside className="flex flex-wrap gap-2">
              {ASPECT_PRESETS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={presetId === item.id ? "default" : "outline"}
                  onClick={() => onPresetId(item.id)}
                >
                  {item.label}
                </Button>
              ))}
              <Cropper.Orientation className="sr-only">Orientation</Cropper.Orientation>
              <Button type="button" size="sm" variant="secondary" onClick={() => onLandscape(!landscape)}>
                {landscape ? "16:9 landscape" : "9:16 portrait"}
              </Button>
            </aside>
          </div>

          <div className="flex flex-wrap gap-2">
            <Cropper.Rotate
              direction="ccw"
              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
              title="Rotate 90° counter-clockwise"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              <span className="sr-only sm:not-sr-only">Rotate CCW</span>
            </Cropper.Rotate>
            <Cropper.Rotate
              direction="cw"
              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
              title="Rotate 90° clockwise"
            >
              <RotateCw className="size-3.5" aria-hidden />
              <span className="sr-only sm:not-sr-only">Rotate CW</span>
            </Cropper.Rotate>
            <Cropper.Flip
              axis="x"
              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
              title="Flip horizontal"
            >
              <FlipHorizontal className="size-3.5" aria-hidden />
              <span className="sr-only sm:not-sr-only">Flip H</span>
            </Cropper.Flip>
            <Cropper.Flip
              axis="y"
              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
              title="Flip vertical"
            >
              <FlipVertical className="size-3.5" aria-hidden />
              <span className="sr-only sm:not-sr-only">Flip V</span>
            </Cropper.Flip>
            <Cropper.Reset className="rounded-md border px-2 py-1 text-xs">
              Reset
            </Cropper.Reset>
          </div>

          <Cropper.Instructions className="sr-only">{instructions}</Cropper.Instructions>
          <Cropper.Announcer announce={announce} />
          <CropperReadout />
        </div>
      </Cropper.Root>

      {loadError ? (
        <p className="text-destructive text-sm" role="alert">
          This photo could not be opened in zriz.
        </p>
      ) : null}

      <ExportBar ready={ready} actionsRef={actionsRef} shape={preset.shape} />
    </div>
  )
}

function ExportBar({
  ready,
  actionsRef,
  shape,
}: {
  ready: boolean
  actionsRef: RefObject<CropperApi | null>
  shape: "rect" | "circle"
}) {
  const [format, setFormat] = useState<ExportFormat>("image/png")
  const [saving, setSaving] = useState(false)
  const [exportFailed, setExportFailed] = useState(false)
  const running = useRef<AbortController | null>(null)

  const download = async () => {
    const cropper = actionsRef.current
    if (!cropper || running.current) return
    const controller = new AbortController()
    running.current = controller
    setSaving(true)
    setExportFailed(false)
    try {
      const { blob, type } = await exportCrop(cropper, {
        type: format,
        quality: format === "image/jpeg" ? 0.92 : undefined,
        signal: controller.signal,
        shape,
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `zriz-crop.${type === "image/jpeg" ? "jpg" : "png"}`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      setExportFailed(!controller.signal.aborted)
    } finally {
      running.current = null
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3 border-t pt-4">
      <div>
        <Label className="mb-1 block text-xs">Download format</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={format === "image/png" ? "default" : "outline"}
            onClick={() => setFormat("image/png")}
          >
            PNG
          </Button>
          <Button
            type="button"
            size="sm"
            variant={format === "image/jpeg" ? "default" : "outline"}
            onClick={() => setFormat("image/jpeg")}
          >
            JPEG
          </Button>
        </div>
      </div>
      <Button
        type="button"
        disabled={!ready}
        aria-disabled={saving}
        onClick={() => void download()}
      >
        {saving ? "Exporting…" : "Download crop"}
      </Button>
      {exportFailed ? (
        <p className="text-destructive text-sm" role="alert">
          Export failed. Try a smaller crop or another format.
        </p>
      ) : null}
    </div>
  )
}