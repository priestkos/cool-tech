import { ForceGraph } from "@/components/ForceGraph"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SAMPLE_NOTES } from "@/data/sample-notes"
import { useEffect } from "react"
import { useLabGraph, type SelectedFact } from "@/features/lab/useLabGraph"

function formatAsOf(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export default function App() {
  const lab = useLabGraph()

  useEffect(() => {
    lab.setSourceText(SAMPLE_NOTES)
    lab.runExtraction(SAMPLE_NOTES, true)
  }, [])

  const seedEntityIds = lab.retrieval?.seeds.map((s) => s.entityId) ?? []

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              HydraDB · SelfGraph concepts
            </p>
            <h1 className="font-semibold text-lg">SelfGraph Lab</h1>
            <p className="text-muted-foreground text-xs">
              Offline knowledge graph with provenance, supersession, and BM25 retrieval — powered
              by lab graph code;{" "}
              <a
                href="https://github.com/hydra-db/selfgraph"
                className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rel="noreferrer"
                target="_blank"
              >
                SelfGraph
              </a>{" "}
              IDs validated in tests.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            No network at runtime
          </Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Source text</CardTitle>
              <CardDescription>
                Paste notes or load the original sample. Extraction uses the deterministic level
                unless mock LLM is enabled.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Label htmlFor="source-text">Notes</Label>
              <textarea
                id="source-text"
                value={lab.sourceText}
                onChange={(e) => lab.setSourceText(e.target.value)}
                rows={7}
                className="min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => lab.runExtraction(lab.sourceText)}>
                  Extract graph
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    lab.setSourceText(SAMPLE_NOTES)
                    lab.runExtraction(SAMPLE_NOTES, true)
                  }}
                >
                  Load sample timeline
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="mock-llm"
                  checked={lab.mockLlm}
                  onCheckedChange={(v) => lab.setMockLlm(v)}
                />
                <Label htmlFor="mock-llm">
                  Mock LLM extraction (adds noisy Thing entities — no API call)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[460px]">
            <CardHeader>
              <CardTitle>Graph view</CardTitle>
              <CardDescription>
                Click a node or edge to inspect source passage. Retired facts stay visible with
                dashed edges.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[420px] overflow-hidden rounded-md border border-border p-0">
              {lab.entities.length === 0 ? (
                <p className="p-6 text-muted-foreground text-sm">
                  Run extraction to populate the graph.
                </p>
              ) : (
                <ForceGraph
                  entities={lab.entities}
                  relations={lab.relations}
                  retiredRelations={lab.retiredRelations}
                  highlightRelationIds={lab.highlightPath}
                  highlightEntityIds={seedEntityIds}
                  onSelectEntity={lab.selectEntity}
                  onSelectRelation={lab.selectRelation}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>As-of queries on valid-time relations.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Label htmlFor="as-of">As of {formatAsOf(lab.asOf)}</Label>
              <input
                id="as-of"
                type="range"
                min={lab.timelineBounds.min}
                max={lab.timelineBounds.max}
                value={lab.asOf.getTime()}
                onChange={(e) => lab.setAsOf(new Date(Number(e.target.value)))}
                className="w-full accent-primary"
              />
              <p className="text-muted-foreground text-xs">
                Slide before June 2026 to see Ann at Northwind; after to see Cascade.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retrieval</CardTitle>
              <CardDescription>BM25 seeds, BFS path, and context passages.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Label htmlFor="question">Question</Label>
              <input
                id="question"
                value={lab.question}
                onChange={(e) => lab.setQuestion(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              />
              <Button type="button" variant="secondary" onClick={lab.ask}>
                Retrieve
              </Button>
              {lab.retrieval && (
                <div className="flex flex-col gap-2 text-xs">
                  <p>
                    <span className="font-medium">Seeds:</span>{" "}
                    {lab.retrieval.seeds.length
                      ? lab.retrieval.seeds
                          .map((s) => `${s.label} (${s.score.toFixed(2)})`)
                          .join(", ")
                      : "none"}
                  </p>
                  <p>
                    <span className="font-medium">Path:</span>{" "}
                    {lab.retrieval.path.map((p) => p.relationType).join(" → ") || "—"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Answerability</CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              {lab.retrieval ? (
                lab.retrieval.answerable ? (
                  <p className="text-success">Graph has seeds for all query terms.</p>
                ) : (
                  <div>
                    <p className="text-destructive">Missing terms:</p>
                    <ul className="mt-1 list-disc pl-4">
                      {lab.retrieval.missingTerms.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )
              ) : (
                <p className="text-muted-foreground">Run a retrieval query.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provenance</CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              {lab.selected ? (
                <FactProvenancePanel selected={lab.selected} />
              ) : (
                <p className="text-muted-foreground">Select a fact on the graph.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}

function FactProvenancePanel({ selected }: { selected: SelectedFact }) {
  if (selected.kind === "entity") {
    return (
      <p>
        <span className="font-medium">{selected.entity.name}</span> ({selected.entity.type})
        <br />
        <span className="text-muted-foreground">Source passage:</span>
        <br />
        {selected.passage?.text ?? "—"}
      </p>
    )
  }
  return (
    <p>
      <span className="font-medium">{selected.relation.type}</span>
      {selected.relation.isCurrent ? null : (
        <Badge variant="outline" className="ml-2">
          retired
        </Badge>
      )}
      <br />
      <span className="text-muted-foreground">Source passage:</span>
      <br />
      {selected.passage?.text ?? "—"}
    </p>
  )
}