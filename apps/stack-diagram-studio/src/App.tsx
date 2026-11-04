import { useCallback, useEffect, useMemo, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { StackDiagram } from "@/components/stack-diagram"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { exportFileBase, paletteForTheme, USER_TILE } from "@/lib/diagram-theme"
import { inferEdges } from "@/lib/edges"
import {
  composeDiagramSvg,
  composeStandaloneHtml,
  downloadTextFile,
  exportPngFromSvg,
} from "@/lib/export"
import { computeAutoLayout, mergePositions } from "@/lib/layout"
import { parseStackSentence } from "@/lib/parser"
import { DEFAULT_SENTENCE, STACK_PRESETS } from "@/lib/presets"
import type { DiagramTheme, PositionMap } from "@/lib/types"
import { decodeAppState, encodeAppState } from "@/lib/url-state"

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

function applyThemeClass(theme: DiagramTheme): void {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

export default function App() {
  const initialHash = decodeAppState(window.location.hash)
  const [sentence, setSentence] = useState(initialHash?.sentence ?? DEFAULT_SENTENCE)
  const [appTheme, setAppTheme] = useState<DiagramTheme>(initialHash?.theme ?? "light")
  const [diagramTheme, setDiagramTheme] = useState<DiagramTheme>(
    initialHash?.diagramTheme ?? initialHash?.theme ?? "light",
  )
  const [manualPositions, setManualPositions] = useState<PositionMap>(initialHash?.positions ?? {})
  const [deletedTileIds, setDeletedTileIds] = useState<Set<string>>(new Set())
  const [tileOverrides, setTileOverrides] = useState<
    Record<string, { label?: string; monogram?: string; isUnknown?: boolean }>
  >({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pngTransparent, setPngTransparent] = useState(false)

  const debouncedSentence = useDebouncedValue(sentence, 280)

  useEffect(() => {
    applyThemeClass(appTheme)
  }, [appTheme])

  const parsed = useMemo(() => parseStackSentence(debouncedSentence), [debouncedSentence])

  const tiles = useMemo(() => {
    return parsed.tiles
      .map((t) => {
        const o = tileOverrides[t.instanceId]
        if (!o) return t
        return { ...t, ...o, label: o.label ?? t.label, monogram: o.monogram ?? t.monogram }
      })
      .filter((t) => !deletedTileIds.has(t.instanceId))
  }, [parsed.tiles, tileOverrides, deletedTileIds])

  const allTiles = useMemo(() => [USER_TILE, ...tiles], [tiles])
  const edges = useMemo(() => inferEdges(allTiles, parsed.edges), [allTiles, parsed.edges])

  const autoLayout = useMemo(() => computeAutoLayout(allTiles), [allTiles])
  const positions = useMemo(
    () => mergePositions(autoLayout.positions, manualPositions),
    [autoLayout.positions, manualPositions],
  )

  useEffect(() => {
    const hash = encodeAppState({
      sentence,
      theme: appTheme,
      diagramTheme,
      positions: manualPositions,
    })
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash)
    }
  }, [sentence, appTheme, diagramTheme, manualPositions])

  const resetLayout = () => setManualPositions({})

  const onPositionChange = useCallback((instanceId: string, pos: { x: number; y: number }) => {
    setManualPositions((prev) => ({ ...prev, [instanceId]: pos }))
  }, [])

  const renameTile = useCallback((instanceId: string, label: string) => {
    setTileOverrides((prev) => ({
      ...prev,
      [instanceId]: {
        ...prev[instanceId],
        label,
        monogram: label.slice(0, 2).toUpperCase(),
        isUnknown: false,
      },
    }))
  }, [])

  const deleteTile = useCallback((instanceId: string) => {
    setDeletedTileIds((prev) => new Set(prev).add(instanceId))
    setSelectedId(null)
  }, [])

  const exportInput = useMemo(
    () => ({
      tiles,
      edges,
      positions,
      layout: autoLayout,
      diagramTheme,
    }),
    [tiles, edges, positions, autoLayout, diagramTheme],
  )

  const exportHtml = () => {
    const base = exportFileBase(sentence)
    const html = composeStandaloneHtml(exportInput, `Stack — ${sentence}`)
    downloadTextFile(`${base}.html`, html, "text/html;charset=utf-8")
  }

  const exportPng = async () => {
    const base = exportFileBase(sentence)
    const svg = composeDiagramSvg(exportInput)
    await exportPngFromSvg(svg, `${base}.png`, 2, pngTransparent)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Stack Diagram Studio</h1>
            <p className="text-xs text-muted-foreground">
              Unofficial community demo. Not affiliated with caru-ini or stack-diagram, or with any
              vendor named. Product names are trademarks of their owners; no official logos are
              used.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Toggle
              pressed={appTheme === "dark"}
              onPressedChange={() => setAppTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label="Toggle app theme"
            >
              {appTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Toggle>
            <Badge variant="outline">Browser-only</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stack sentence</CardTitle>
              <CardDescription>
                Describe your stack in one line. Parsed locally — no LLM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder="Next.js on Vercel, Hono API, Postgres on Neon…"
                aria-label="Stack sentence"
              />
              <div className="space-y-1">
                <Label htmlFor="preset">Presets</Label>
                <Select
                  value=""
                  onValueChange={(id) => {
                    const preset = STACK_PRESETS.find((p) => p.id === id)
                    if (preset) {
                      setSentence(preset.sentence)
                      setManualPositions({})
                      setTileOverrides({})
                      setDeletedTileIds(new Set())
                    }
                  }}
                >
                  <SelectTrigger id="preset" className="w-full">
                    <SelectValue placeholder="Load a preset…" />
                  </SelectTrigger>
                  <SelectContent>
                    {STACK_PRESETS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diagram</CardTitle>
              <CardDescription>Drag tiles (8px grid). Arrows follow automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Diagram theme</Label>
                <Toggle
                  pressed={diagramTheme === "dark"}
                  onPressedChange={() =>
                    setDiagramTheme((t) => (t === "dark" ? "light" : "dark"))
                  }
                >
                  {diagramTheme === "dark" ? "Dark" : "Light"}
                </Toggle>
              </div>
              <Button variant="outline" className="w-full" onClick={resetLayout}>
                Reset layout
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export</CardTitle>
              <CardDescription>Standalone HTML or 2× PNG from SVG.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button className="flex-1" onClick={exportHtml}>
                  Export HTML
                </Button>
                <Button className="flex-1" variant="secondary" onClick={() => void exportPng()}>
                  Export PNG
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="transparent"
                  checked={pngTransparent}
                  onCheckedChange={(v) => setPngTransparent(v === true)}
                />
                <Label htmlFor="transparent">Transparent PNG background</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Live diagram</CardTitle>
            <CardDescription>
              Layers: User → Client → Hosting → API → Data &amp; services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StackDiagram
              tiles={tiles}
              edges={edges}
              positions={positions}
              layout={autoLayout}
              diagramTheme={diagramTheme}
              onPositionChange={onPositionChange}
              onRenameTile={renameTile}
              onDeleteTile={deleteTile}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Idea inspired by{" "}
              <a
                className="underline"
                href="https://github.com/caru-ini/stack-diagram"
                target="_blank"
                rel="noreferrer"
              >
                caru-ini/stack-diagram
              </a>{" "}
              (MIT). Diagram colors:{" "}
              <span style={{ color: paletteForTheme(diagramTheme).muted }}>neutral palette</span>.
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Idea inspired by caru-ini/stack-diagram (MIT) ·{" "}
        <a
          className="underline"
          href="https://x.com/caru_ini/status/2117422380935168035"
          target="_blank"
          rel="noreferrer"
        >
          source buzz
        </a>
      </footer>
    </div>
  )
}
