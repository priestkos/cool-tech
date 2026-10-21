import { render as peleRender } from "pele"
import mermaid from "mermaid"
import { useCallback, useMemo, useState } from "react"
import { MermaidPanel } from "@/components/MermaidPanel"
import { PelePanel } from "@/components/PelePanel"
import { ThemePanel } from "@/components/ThemePanel"
import { TimingBar } from "@/components/TimingBar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { DEFAULT_SOURCE, PRESETS, type PresetId } from "@/lib/presets"
import { DEFAULT_PELE_THEME, type PeleTheme } from "@/lib/peleTheme"
import { averageMs } from "@/lib/timing"

const RACE_ITERATIONS = 50

export default function App() {
  const [source, setSource] = useState(DEFAULT_SOURCE)
  const [activePreset, setActivePreset] = useState<PresetId | "custom">("flowchart")
  const debouncedSource = useDebouncedValue(source, 280)
  const [peleLastMs, setPeleLastMs] = useState<number | null>(null)
  const [mermaidLastMs, setMermaidLastMs] = useState<number | null>(null)
  const [raceBusy, setRaceBusy] = useState(false)
  const [peleRaceAvgMs, setPeleRaceAvgMs] = useState<number | null>(null)
  const [mermaidRaceAvgMs, setMermaidRaceAvgMs] = useState<number | null>(null)
  const [theme, setTheme] = useState<PeleTheme>(DEFAULT_PELE_THEME)
  const [shrinkEnabled, setShrinkEnabled] = useState(false)
  const [panelWidthPercent, setPanelWidthPercent] = useState(100)

  const peleWidth = shrinkEnabled ? panelWidthPercent : 100

  const handlePeleRendered = useCallback((ms: number) => {
    setPeleLastMs(ms)
  }, [])

  const handleMermaidRendered = useCallback((ms: number) => {
    setMermaidLastMs(ms)
  }, [])

  const presetItems = useMemo(
    () => Object.entries(PRESETS) as [PresetId, (typeof PRESETS)[PresetId]][],
    [],
  )

  const runRace = async () => {
    setRaceBusy(true)
    try {
      const peleSamples: number[] = []
      for (let i = 0; i < RACE_ITERATIONS; i++) {
        const start = performance.now()
        try {
          peleRender(debouncedSource)
        } catch {
          // invalid diagrams still count toward wall time
        }
        peleSamples.push(performance.now() - start)
      }

      mermaid.initialize({ startOnLoad: false, theme: "neutral" })
      const mermaidSamples: number[] = []
      for (let i = 0; i < RACE_ITERATIONS; i++) {
        const start = performance.now()
        await mermaid.render(`race-${i}-${Date.now()}`, debouncedSource)
        mermaidSamples.push(performance.now() - start)
      }

      setPeleRaceAvgMs(averageMs(peleSamples))
      setMermaidRaceAvgMs(averageMs(mermaidSamples))
    } finally {
      setRaceBusy(false)
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b px-4 py-6 md:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Pele Diagram Race</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Same Mermaid source, two renderers:{" "}
          <a
            className="underline"
            href="https://github.com/obsidianmd/pele"
            target="_blank"
            rel="noreferrer"
          >
            Pele
          </a>{" "}
          (sync, dependency-free) vs{" "}
          <a
            className="underline"
            href="https://mermaid.js.org"
            target="_blank"
            rel="noreferrer"
          >
            mermaid.js
          </a>
          . Live timing, theme variables, and a narrow-container stress test.
        </p>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mermaid source</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1">
                {presetItems.map(([id, preset]) => (
                  <Button
                    key={id}
                    type="button"
                    size="sm"
                    variant={activePreset === id ? "default" : "outline"}
                    onClick={() => {
                      setActivePreset(id)
                      setSource(preset.source)
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Textarea
                value={source}
                onChange={(event) => {
                  setSource(event.target.value)
                  setActivePreset("custom")
                }}
                className="min-h-64 font-mono text-xs"
                spellCheck={false}
              />
              {activePreset === "custom" ? (
                <Badge variant="outline">Custom diagram</Badge>
              ) : null}
            </CardContent>
          </Card>
          <ThemePanel
            theme={theme}
            onChange={setTheme}
            shrinkEnabled={shrinkEnabled}
            onShrinkEnabledChange={setShrinkEnabled}
            panelWidthPercent={panelWidthPercent}
            onPanelWidthChange={setPanelWidthPercent}
          />
        </section>

        <section className="flex flex-col gap-4">
          <TimingBar
            peleLastMs={peleLastMs}
            mermaidLastMs={mermaidLastMs}
            raceBusy={raceBusy}
            raceIterations={RACE_ITERATIONS}
            peleRaceAvgMs={peleRaceAvgMs}
            mermaidRaceAvgMs={mermaidRaceAvgMs}
            onRace={() => void runRace()}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h2 className="mb-2 text-sm font-medium">Pele</h2>
              <PelePanel
                source={debouncedSource}
                theme={theme}
                panelWidthPercent={peleWidth}
                onRendered={handlePeleRendered}
              />
            </div>
            <div>
              <h2 className="mb-2 text-sm font-medium">mermaid.js</h2>
              <MermaidPanel
                source={debouncedSource}
                onRendered={handleMermaidRendered}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
