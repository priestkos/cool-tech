import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CoverageHeatmap } from "@/features/explorer/CoverageHeatmap"
import { ExampleBanner } from "@/features/explorer/ExampleBanner"
import { FileDropZone } from "@/features/explorer/FileDropZone"
import { FindingsPanel } from "@/features/explorer/FindingsPanel"
import { ReportPreview } from "@/features/explorer/ReportPreview"
import { RunDiffPanel } from "@/features/explorer/RunDiffPanel"
import { ValidationPanel } from "@/features/explorer/ValidationPanel"
import { EXAMPLE_RUN_ALPHA, EXAMPLE_RUN_BETA } from "@/fixtures/load-examples"
import { useExplorer } from "@/features/explorer/useExplorer"

export default function App() {
  const explorer = useExplorer()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-border/70 bg-card/70 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Security Audit Explorer
              </h1>
              <Badge variant="outline">Offline</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Browse Cloudflare security-audit-skill run artifacts with vendored schema validators, coverage
              heatmaps, report preview, and run diff. No API keys or network calls at runtime.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={explorer.loadAlpha}>
              Load Example Alpha
            </Button>
            <Button type="button" variant="outline" onClick={explorer.loadBetaAsPrimary}>
              Load Example Beta
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6">
        {explorer.primary.isExample ? <ExampleBanner label={explorer.primary.label} /> : null}

        <FileDropZone onFiles={explorer.ingestDrop} />
        {explorer.dropError ? (
          <p role="alert" className="text-destructive text-sm">
            {explorer.dropError}
          </p>
        ) : null}

        <ValidationPanel
          findingsErrors={explorer.primaryValidation.findingsErrors}
          ledgerErrors={explorer.primaryValidation.ledgerErrors}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <FindingsPanel findings={explorer.primary.findings} />
          <div className="space-y-6">
            <CoverageHeatmap ledger={explorer.primary.ledger} />
            <ReportPreview markdown={explorer.primary.reportMarkdown} />
          </div>
        </div>

        <RunDiffPanel left={EXAMPLE_RUN_ALPHA} right={EXAMPLE_RUN_BETA} />
      </main>
    </div>
  )
}
