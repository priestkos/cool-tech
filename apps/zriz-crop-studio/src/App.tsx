import type { Cropper as CropperApi } from "@zriz/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BeforeAfterPreview } from "@/features/crop/BeforeAfterPreview"
import { CropStudioEditor } from "@/features/crop/CropStudioEditor"
import type { AspectPresetId } from "@/features/crop/aspectPresets"
import { UploadZone } from "@/features/crop/UploadZone"
import { exportCrop } from "@zriz/core/dom"
import { presetById } from "@/features/crop/aspectPresets"

const SAMPLE_SRC = "/sample.svg"

export default function App() {
  const [src, setSrc] = useState<string | File | null>(SAMPLE_SRC)
  const [presetId, setPresetId] = useState<AspectPresetId>("free")
  const [landscape, setLandscape] = useState(true)
  const [ready, setReady] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const actionsRef = useRef<CropperApi | null>(null)
  const [beforeUrl, setBeforeUrl] = useState<string | null>(SAMPLE_SRC)

  useEffect(() => {
    if (typeof src === "string") {
      setBeforeUrl(src)
      return
    }
    if (src instanceof File) {
      const url = URL.createObjectURL(src)
      setBeforeUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setBeforeUrl(null)
  }, [src])

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  const refreshPreview = useCallback(async () => {
    const cropper = actionsRef.current
    if (!cropper || !ready) return
    setPreviewLoading(true)
    try {
      const preset = presetById(presetId)
      const { blob } = await exportCrop(cropper, {
        type: "image/png",
        shape: preset.shape,
      })
      const url = URL.createObjectURL(blob)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
    } finally {
      setPreviewLoading(false)
    }
  }, [presetId, ready])

  const onPreviewBlob = useCallback((blob: Blob | null) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
  }, [])

  const onFile = (file: File) => setSrc(file)
  const onSample = () => setSrc(SAMPLE_SRC)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Zriz Crop Studio
              </h1>
              <Badge variant="outline">@zriz/react 0.2.1</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Offline crop lab wired to the real{" "}
              <a
                href="https://github.com/pqoqubbw/zriz"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                zriz
              </a>{" "}
              cropper (MIT) — straighten dial, rotate, flip, zoom, aspect presets, and export via{" "}
              <code className="text-xs">@zriz/core/dom</code>, not a local reimplementation.
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:max-w-xs sm:text-right">
            Images stay in-browser · no API keys ·{" "}
            <a href="https://zriz.dev" className="underline" target="_blank" rel="noreferrer">
              zriz.dev
            </a>
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crop workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <UploadZone onFile={onFile} onSample={onSample} />
            <CropStudioEditor
              src={src}
              presetId={presetId}
              landscape={landscape}
              onPresetId={setPresetId}
              onLandscape={setLandscape}
              onReadyChange={setReady}
              onPreviewBlob={onPreviewBlob}
              actionsRef={actionsRef}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Before / after</CardTitle>
            </CardHeader>
            <CardContent>
              <BeforeAfterPreview
                beforeUrl={beforeUrl}
                afterUrl={previewUrl}
                loading={previewLoading}
                onRefresh={() => void refreshPreview()}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">About & credits</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm leading-relaxed">
              <p>
                Independent demo for{" "}
                <a href="https://zriz.dev" target="_blank" rel="noreferrer" className="underline">
                  zriz
                </a>
                . Pinned{" "}
                <code className="text-xs text-foreground">@zriz/react@0.2.1</code> and{" "}
                <code className="text-xs text-foreground">@zriz/core@0.2.1</code> (MIT).
              </p>
              <ul className="list-inside list-disc text-xs">
                <li>
                  <a
                    href="https://github.com/pqoqubbw/zriz"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    github.com/pqoqubbw/zriz
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/pqoqubbw/status/2120196887156543507"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Launch post (Nov 2026)
                  </a>
                </li>
              </ul>
              <p className="text-xs">Not affiliated with the zriz project.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}