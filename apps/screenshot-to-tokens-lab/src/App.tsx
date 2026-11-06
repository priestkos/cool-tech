import { useCallback, useEffect, useMemo, useState } from "react"
import { AppHeader } from "@/components/AppHeader"
import { ContrastPanel } from "@/components/ContrastPanel"
import { ExtractionPanel } from "@/components/ExtractionPanel"
import { FixturePicker } from "@/components/FixturePicker"
import { PreviewPanel } from "@/components/PreviewPanel"
import { RewriteTeasePanel } from "@/components/RewriteTeasePanel"
import { TokenTreePanel } from "@/components/TokenTreePanel"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ALL_FIXTURES } from "@/lib/fixtures/catalog"
import { cloneFixtureTokens, defaultFixtureId, loadFixture } from "@/lib/fixture-loader"
import {
  buildPreviewContrastPairs,
  evaluateContrastPair,
} from "@/lib/contrast"
import {
  advanceExtraction,
  cancelExtraction,
  initialExtractionState,
  startExtraction,
  type ExtractionState,
} from "@/lib/extraction"
import {
  applyPrimitiveEdit,
  applyTokenMetaEdit,
  resolveTokens,
  resolvedWithDarkMode,
} from "@/lib/token-cascade"
import {
  parseHashState,
  readLocalLabState,
  syncUrlHash,
  writeLocalLabState,
  type PersistedLabState,
} from "@/lib/url-state"
import type { FixtureId } from "@/lib/fixtures/types"
import type { FixturePack } from "@/lib/fixtures/types"

const STAGE_MS = 450

function readInitialState(): PersistedLabState {
  const fallback = defaultFixtureId()
  const fromHash =
    typeof window !== "undefined" ? parseHashState(window.location.hash, fallback) : null
  if (fromHash && loadFixture(fromHash.fixtureId)) {
    return fromHash
  }
  return readLocalLabState(fallback)
}

export default function App() {
  const [persisted, setPersisted] = useState<PersistedLabState>(readInitialState)
  const [fixture, setFixture] = useState<FixturePack>(() => {
    const loaded = loadFixture(persisted.fixtureId) ?? loadFixture(defaultFixtureId())
    return cloneFixtureTokens(loaded!)
  })
  const [overrides, setOverrides] = useState<Record<string, string>>(persisted.overrides)
  const [dark, setDark] = useState(persisted.dark)
  const [extraction, setExtraction] = useState<ExtractionState>(initialExtractionState)
  const [tokensVisible, setTokensVisible] = useState(false)
  const [highlightFailing, setHighlightFailing] = useState(false)

  const persist = useCallback((next: Partial<PersistedLabState>) => {
    setPersisted((prev) => {
      const merged: PersistedLabState = {
        fixtureId: (next.fixtureId ?? prev.fixtureId) as FixtureId,
        overrides: next.overrides ?? prev.overrides,
        dark: next.dark ?? prev.dark,
      }
      writeLocalLabState(merged)
      syncUrlHash(merged)
      return merged
    })
  }, [])

  useEffect(() => {
    writeLocalLabState({ fixtureId: fixture.id as FixtureId, overrides, dark })
    syncUrlHash({ fixtureId: fixture.id as FixtureId, overrides, dark })
  }, [fixture.id, overrides, dark])

  useEffect(() => {
    if (extraction.phase !== "running") {
      return undefined
    }
    const timer = window.setInterval(() => {
      setExtraction((prev) => {
        const next = advanceExtraction(prev)
        if (next.phase === "done") {
          setTokensVisible(true)
          window.clearInterval(timer)
        }
        return next
      })
    }, STAGE_MS)
    return () => window.clearInterval(timer)
  }, [extraction.phase, extraction.runId])

  const handleFixtureSelect = (id: string) => {
    const nextFixture = loadFixture(id)
    if (!nextFixture) {
      return
    }
    setFixture(cloneFixtureTokens(nextFixture))
    setOverrides({})
    setTokensVisible(false)
    setExtraction(initialExtractionState())
    persist({ fixtureId: nextFixture.id as FixtureId, overrides: {}, dark })
  }

  const handleRunExtraction = () => {
    setTokensVisible(false)
    setExtraction((prev) => startExtraction(prev))
  }

  const handleCancelExtraction = () => {
    setExtraction((prev) => cancelExtraction(prev))
  }

  const handlePrimitiveChange = (id: string, value: string) => {
    setFixture((prev) => applyPrimitiveEdit(prev, id, value))
    setOverrides((prev) => {
      const next = { ...prev, [id]: value }
      persist({ overrides: next })
      return next
    })
  }

  const handleMetaToggle = (id: string, field: "accepted" | "merged") => {
    setFixture((prev) => {
      const record =
        prev.primitives.find((t) => t.id === id) ??
        prev.semantic.find((t) => t.id === id) ??
        prev.component.find((t) => t.id === id)
      const nextVal = record ? !record[field] : true
      return applyTokenMetaEdit(prev, id, { [field]: nextVal })
    })
  }

  const handleRename = (id: string, name: string) => {
    setFixture((prev) => applyTokenMetaEdit(prev, id, { name }))
  }

  const resolved = useMemo(() => {
    const base = resolveTokens(fixture, overrides)
    return resolvedWithDarkMode(fixture, base, dark)
  }, [fixture, overrides, dark])

  const contrastResults = useMemo(() => {
    const text = resolved.byId.get("color-text-primary") ?? "#111827"
    const canvas = resolved.byId.get("color-bg-canvas") ?? "#ffffff"
    const card = resolved.byId.get("card-surface-bg") ?? "#ffffff"
    const accent = resolved.byId.get("color-accent") ?? "#2563eb"
    const sidebar = resolved.byId.get("sidebar-bg") ?? "#0f172a"
    return buildPreviewContrastPairs({ text, canvas, card, accent, sidebar }).map(
      evaluateContrastPair,
    )
  }, [resolved])

  const failingIds = useMemo(
    () => new Set(contrastResults.filter((r) => !r.aaNormal).map((r) => r.id)),
    [contrastResults],
  )

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div>
              <h2 className="mb-2 text-sm font-medium">Sample dashboard fixtures</h2>
              <FixturePicker
                fixtures={ALL_FIXTURES}
                selectedId={fixture.id}
                onSelect={handleFixtureSelect}
                disabled={extraction.phase === "running"}
              />
            </div>
            <ExtractionPanel
              state={extraction}
              onRun={handleRunExtraction}
              onCancel={handleCancelExtraction}
              tokensVisible={tokensVisible}
            />
            <TokenTreePanel
              fixture={fixture}
              overrides={overrides}
              onPrimitiveChange={handlePrimitiveChange}
              onMetaToggle={handleMetaToggle}
              onRename={handleRename}
              visible={tokensVisible}
            />
            <RewriteTeasePanel examples={fixture.rewriteExamples} />
          </section>
          <section className="space-y-6">
            <PreviewPanel
              cssVariables={resolved.cssVariables}
              dark={dark}
              onDarkChange={setDark}
              highlightFailing={highlightFailing}
              failingPairIds={failingIds}
            />
            <ContrastPanel
              results={contrastResults}
              highlightFailing={highlightFailing}
              onHighlightChange={setHighlightFailing}
            />
          </section>
        </main>
      </div>
    </TooltipProvider>
  )
}
