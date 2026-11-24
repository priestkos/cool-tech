import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AboutPanel } from "@/features/studio/AboutPanel"
import { GalleryRail, type GalleryItem } from "@/features/studio/GalleryRail"
import { SlicerPanel, type SlicerFormState } from "@/features/studio/SlicerPanel"
import { ViewerStage } from "@/features/studio/ViewerStage"
import { UPSTREAM_PIN } from "@/constants"

const defaultForm: SlicerFormState = {
  slices: 24,
  round: false,
  colours: 24,
  advancedOpen: false,
  order: "auto",
  sideNose: "left",
  shade: 0.2,
  preview: false,
  normals: false,
  emissive: false,
}

export default function App() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [active, setActive] = useState<GalleryItem | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [form, setForm] = useState<SlicerFormState>(defaultForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/gallery-data/manifest.json")
      .then((r) => r.json())
      .then((data: { items: GalleryItem[] }) => {
        setGallery(data.items ?? [])
        if (data.items?.[0]) {
          setActive(data.items[0])
          setViewerUrl(data.items[0].viewerUrl)
        }
      })
      .catch(() => setGallery([]))
  }, [])

  const openGalleryItem = useCallback((item: GalleryItem) => {
    setActive(item)
    setViewerUrl(item.viewerUrl)
    setError(null)
    setForm((f) => ({
      ...f,
      round: Boolean(item.options?.round),
      slices: typeof item.options?.slices === "number" ? item.options.slices : f.slices,
      colours: typeof item.options?.colours === "number" ? item.options.colours : f.colours,
    }))
  }, [])

  const sliceUpload = useCallback(
    async (file: File) => {
      setBusy(true)
      setError(null)
      const body = new FormData()
      body.append("file", file)
      body.append("slices", String(form.slices))
      body.append("round", form.round ? "true" : "false")
      body.append("colours", String(form.colours))
      body.append("order", form.order)
      body.append("sideNose", form.sideNose)
      body.append("shade", String(form.shade))
      body.append("preview", form.preview ? "true" : "false")
      body.append("normals", form.normals ? "true" : "false")
      body.append("emissive", form.emissive ? "true" : "false")
      try {
        const res = await fetch("/api/slice", { method: "POST", body })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Slice failed")
        setViewerUrl(data.viewerUrl)
        setActive({
          id: "upload",
          title: data.title ?? file.name,
          viewerUrl: data.viewerUrl,
          stripUrl: data.stripUrl,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed")
      } finally {
        setBusy(false)
      }
    },
    [form],
  )

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5 md:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-sm font-semibold tracking-tight md:text-base">Sprite Stack Studio</h1>
          <Badge variant="secondary" className="text-[10px] uppercase">
            Real upstream
          </Badge>
          <span className="text-xs text-muted-foreground">
            <code className="text-[10px]">{UPSTREAM_PIN.commit.slice(0, 7)}</code>
          </span>
        </div>
        <AboutPanel />
      </header>

      <div className="grid flex-1 gap-0 lg:grid-cols-[minmax(280px,320px)_1fr]">
        <aside className="flex flex-col gap-4 border-b border-border p-4 lg:border-b-0 lg:border-r">
          <GalleryRail items={gallery} activeId={active?.id} onSelect={openGalleryItem} />
          <SlicerPanel form={form} onChange={setForm} onUpload={sliceUpload} busy={busy} error={error} />
        </aside>
        <main className="min-h-[50vh] flex-1 p-3 md:p-4">
          <ViewerStage viewerUrl={viewerUrl} title={active?.title ?? "Viewer"} />
        </main>
      </div>
    </div>
  )
}