import type { AxisState } from "@/lib/allo-axes"
import { axisStyle } from "@/lib/allo-axes"
import type { FeatureId, FeatureState } from "@/lib/allo-features"
import {
  FEATURE_IDS,
  FEATURE_LABELS,
  FEATURE_SAMPLES,
  buildFontFeatureSettings,
  featureStyle,
} from "@/lib/allo-features"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CodeBlock } from "@/components/CodeBlock"

type FeatureTogglesProps = {
  axes: AxisState
  features: FeatureState
  onToggle: (id: FeatureId, on: boolean) => void
}

function sampleStyle(axes: AxisState, features: FeatureState, id: FeatureId, enabled: boolean) {
  const slice: FeatureState = { ...features, [id]: enabled }
  return { ...axisStyle(axes), ...featureStyle(slice) }
}

export function FeatureToggles({ axes, features, onToggle }: FeatureTogglesProps) {
  const output = buildFontFeatureSettings(features)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature toggles</CardTitle>
        <CardDescription>Stylistic sets, character variants, and figure features.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="divide-y divide-border">
          {FEATURE_IDS.map((id) => (
            <li key={id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start">
              <div className="flex min-w-40 items-center justify-between gap-3 sm:flex-col sm:items-start">
                <div>
                  <p className="text-sm font-medium">{FEATURE_LABELS[id]}</p>
                  <p className="text-muted-foreground font-mono text-xs">{id}</p>
                </div>
                <Switch
                  checked={features[id]}
                  onCheckedChange={(on) => onToggle(id, on)}
                  aria-label={`Toggle ${id}`}
                />
              </div>
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground text-[10px] uppercase">Off</Label>
                  <p
                    className="whitespace-pre-wrap text-lg leading-snug"
                    style={sampleStyle(axes, features, id, false)}
                  >
                    {FEATURE_SAMPLES[id].off}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-[10px] uppercase">On</Label>
                  <p
                    className="whitespace-pre-wrap text-lg leading-snug"
                    style={sampleStyle(axes, features, id, true)}
                  >
                    {FEATURE_SAMPLES[id].on}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <CodeBlock
          code={output === "normal" ? "font-feature-settings: normal;" : `font-feature-settings: ${output};`}
          label="Copy feature settings"
        />
      </CardContent>
    </Card>
  )
}