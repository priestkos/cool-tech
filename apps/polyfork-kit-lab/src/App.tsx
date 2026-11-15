import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KitBrowser } from "@/features/polyfork/KitBrowser"
import { KnobPanel, SnippetCard } from "@/features/polyfork/KnobPanel"
import { PreviewCanvas } from "@/features/polyfork/PreviewCanvas"
import { ComposerCanvas } from "@/features/polyfork/ComposerCanvas"
import { meshModeLabel, networkModeLabel } from "@/features/polyfork/modes"
import { snippetBlock } from "@/features/polyfork/snippet"
import { usePolyforkLab } from "@/features/polyfork/usePolyforkLab"
import type { PreviewMeshMode } from "@/features/polyfork/types"

const POLYFORK_LINKS = {
  site: "https://polyfork.dev",
  catalog: "https://github.com/lucas-martinic/polyfork-catalog",
  licensing: "https://polyfork.dev/licensing",
  sourcePost: "https://x.com/songsong/status/2121055884294185400",
}

export default function App() {
  const lab = usePolyforkLab()
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  const assetsById = useMemo(() => {
    const m = new Map<string, import("@/features/polyfork/types").CatalogAsset>()
    lab.catalog?.assets.forEach((a) => m.set(a.id, a))
    return m
  }, [lab.catalog])

  const snippet = lab.selected ? snippetBlock(lab.selected) : ""

  const onCopySnippet = async () => {
    if (!snippet) return
    try {
      await navigator.clipboard.writeText(snippet)
      setCopyStatus("Copied")
      setTimeout(() => setCopyStatus(null), 2000)
    } catch {
      setCopyStatus("Clipboard blocked")
    }
  }

  if (lab.loadError) {
    return (
      <div className="p-6 text-sm text-destructive">
        Failed to load catalog: {lab.loadError}
      </div>
    )
  }

  if (!lab.catalog) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading catalog snapshot…
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-[1680px] flex-col gap-3 p-3 md:p-4 lg:h-svh lg:max-h-svh lg:overflow-hidden">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Polyfork Kit Lab</h1>
          <p className="max-w-2xl text-xs text-muted-foreground">
            Demo lab for{" "}
            <a
              href={POLYFORK_LINKS.site}
              className="underline underline-offset-2"
            >
              Polyfork
            </a>{" "}
            — browse the public catalog, preview meshes in three.js, tune{" "}
            <code className="text-[10px]">createAsset</code> knobs, and compose kit
            scenes. No Polyfork <code className="text-[10px]">.mjs</code> source is
            redistributed; parametric modules load from the official CDN only in live
            mode.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="network-mode"
              checked={lab.networkMode === "live"}
              onCheckedChange={(on) =>
                lab.setNetworkMode(on ? "live" : "offline")
              }
              aria-label="Toggle Live Polyfork CDN mode"
            />
            <Label htmlFor="network-mode" className="text-xs">
              {networkModeLabel(lab.networkMode)}
            </Label>
          </div>
          <Badge variant="outline">{lab.catalog.models} models</Badge>
        </div>
      </header>

      <Tabs defaultValue="browse" className="flex min-h-0 flex-1 flex-col gap-2">
        <TabsList aria-label="Lab sections">
          <TabsTrigger value="browse">Browse & preview</TabsTrigger>
          <TabsTrigger value="composer">Scene composer</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
          <aside className="flex w-full flex-col gap-3 lg:max-w-sm lg:shrink-0 lg:overflow-y-auto">
            <KitBrowser
              kits={lab.catalog.kits}
              types={lab.types}
              assets={lab.filtered}
              query={lab.query}
              kitFilter={lab.kitFilter}
              typeFilter={lab.typeFilter}
              selectedId={lab.selected?.id ?? null}
              networkMode={lab.networkMode}
              onQuery={lab.setQuery}
              onKit={lab.setKitFilter}
              onType={lab.setTypeFilter}
              onSelect={lab.selectAsset}
            />
          </aside>
          <main className="flex min-h-0 flex-1 flex-col gap-3">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-sm">
                    {lab.selected?.title ?? "Select a model"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {lab.selected
                      ? `${lab.selected.type} · ${lab.selected.triangles} tris`
                      : "Pick from the kit browser"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {lab.allowedMeshModes.map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      size="sm"
                      variant={lab.meshMode === mode ? "default" : "outline"}
                      onClick={() => lab.setMeshMode(mode as PreviewMeshMode)}
                    >
                      {meshModeLabel(mode)}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="h-[min(52vh,520px)] min-h-[280px]">
                <PreviewCanvas
                  asset={lab.selected}
                  networkMode={lab.networkMode}
                  meshMode={lab.meshMode}
                  knobValues={lab.knobValues}
                  onTiming={lab.recordTiming}
                  onError={setPreviewError}
                />
                {previewError ? (
                  <p className="mt-2 text-xs text-destructive" role="alert">
                    {previewError}
                  </p>
                ) : null}
              </CardContent>
            </Card>
            <PreviewSideRow lab={lab} snippet={snippet} onCopy={onCopySnippet} copyStatus={copyStatus} />
          </main>
        </TabsContent>

        <TabsContent value="composer" className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
          <aside className="w-full space-y-3 lg:max-w-xs lg:shrink-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Composer</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Drop parts from one kit. Click a part to select; click the grid to
                  move. Offline uses placeholder primitives only.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button
                  type="button"
                  disabled={!lab.selected}
                  onClick={lab.addToComposer}
                >
                  Add selected to grid
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!lab.selectedComposerId}
                  onClick={() =>
                    lab.rotateComposerPart(lab.selectedComposerId!, 45)
                  }
                >
                  Rotate +45°
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!lab.selectedComposerId}
                  onClick={() => {
                    if (lab.selectedComposerId)
                      lab.removeComposerPart(lab.selectedComposerId)
                    lab.setSelectedComposerId(null)
                  }}
                >
                  Remove part
                </Button>
                <Separator />
                <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
                  {lab.composerParts.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={`w-full rounded px-2 py-1 text-left hover:bg-muted ${
                          p.id === lab.selectedComposerId ? "bg-muted font-medium" : ""
                        }`}
                        onClick={() => lab.setSelectedComposerId(p.id)}
                      >
                        {p.title} ({p.x.toFixed(1)}, {p.z.toFixed(1)})
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {lab.selected ? (
              <SnippetCard text={snippet} onCopy={onCopySnippet} />
            ) : null}
          </aside>
          <main className="min-h-[360px] flex-1">
            <ComposerCanvas
              parts={lab.composerParts}
              assetsById={assetsById}
              selectedId={lab.selectedComposerId}
              onSelect={lab.setSelectedComposerId}
              onMove={lab.moveComposerPart}
            />
          </main>
        </TabsContent>
      </Tabs>

      <footer className="text-[10px] text-muted-foreground">
        Models & catalog index:{" "}
        <a href={POLYFORK_LINKS.catalog} className="underline">
          polyfork-catalog
        </a>{" "}
        · Licensing:{" "}
        <a href={POLYFORK_LINKS.licensing} className="underline">
          polyfork.dev/licensing
        </a>{" "}
        · Inspiration:{" "}
        <a href={POLYFORK_LINKS.sourcePost} className="underline">
          source post
        </a>
        {copyStatus ? ` · ${copyStatus}` : ""}
      </footer>
    </div>
  )
}

function PreviewSideRow({
  lab,
  snippet,
  onCopy,
  copyStatus,
}: {
  lab: ReturnType<typeof usePolyforkLab>
  snippet: string
  onCopy: () => void
  copyStatus: string | null
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <KnobPanel
        knobs={lab.knobs}
        values={lab.knobValues}
        meshMode={lab.meshMode}
        loadTiming={lab.lastLoadTiming}
        onChange={lab.setKnob}
      />
      {lab.selected ? (
        <SnippetCard text={snippet} onCopy={onCopy} />
      ) : (
        <Card>
          <CardContent className="py-6 text-xs text-muted-foreground">
            Select a model to copy an import snippet or{" "}
            <code>npx polyfork@0.1.1 add &lt;id&gt;</code>.
            {copyStatus ? ` ${copyStatus}` : ""}
          </CardContent>
        </Card>
      )}
    </div>
  )
}