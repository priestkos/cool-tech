import type { AxisState } from "@/lib/allo-axes"
import { axisStyle } from "@/lib/allo-axes"
import type { FeatureState } from "@/lib/allo-features"
import { featureStyle } from "@/lib/allo-features"
import { PRESETS, buildCopyCssBlock, type PresetId } from "@/lib/allo-presets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/CodeBlock"

type UiPreviewProps = {
  axes: AxisState
  features: FeatureState
  activePreset: PresetId | null
  onPreset: (id: PresetId) => void
}

export function UiPreview({ axes, features, activePreset, onPreset }: UiPreviewProps) {
  const panelStyle = { ...axisStyle(axes), ...featureStyle(features, true) }
  const exportCss = buildCopyCssBlock(axes, features, { calt: true, selector: ".allo-ui" })

  return (
    <Card>
      <CardHeader>
        <CardTitle>UI preview</CardTitle>
        <CardDescription>Personality presets and a miniature interface mock-up.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRESETS) as PresetId[]).map((id) => (
            <Button
              key={id}
              type="button"
              variant={activePreset === id ? "default" : "outline"}
              size="sm"
              onClick={() => onPreset(id)}
            >
              {PRESETS[id].label}
            </Button>
          ))}
        </div>

        <div
          className="border-border bg-card space-y-4 rounded-xl border p-4 shadow-sm sm:p-6"
          style={panelStyle}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold tracking-tight">Team inbox</h3>
            <Badge variant="secondary">3 new</Badge>
          </div>
          <p className="text-muted-foreground text-sm" style={panelStyle}>
            Review feedback {"->"} ship updates {"=>"} celebrate. Tabular totals:{" "}
            <span className="tabular-nums">1,248.00</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className="pointer-events-none">
              Compose
            </Button>
            <Button type="button" size="sm" variant="outline" className="pointer-events-none">
              Archive
            </Button>
          </div>
        </div>

        <CodeBlock code={exportCss} label="Copy full CSS block" />
      </CardContent>
    </Card>
  )
}