import { useState } from "react"
import type { AxisState } from "@/lib/allo-axes"
import { axisStyle } from "@/lib/allo-axes"
import { buildFontFeatureSettings, featureStyle } from "@/lib/allo-features"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CodeBlock } from "@/components/CodeBlock"

const DEFAULT_TEXT =
  "Navigate -> forward => back (SHIFT) for ¡Hola! — price $42 vs 3/4"

type ContextualBoxProps = {
  axes: AxisState
}

export function ContextualBox({ axes }: ContextualBoxProps) {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [caltOn, setCaltOn] = useState(true)

  const base = axisStyle(axes)
  const withCalt = { ...base, ...featureStyle({}, caltOn ? true : false) }
  const withoutCalt = { ...base, ...featureStyle({}, false) }

  const output = buildFontFeatureSettings({}, { calt: caltOn })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contextual alternates</CardTitle>
        <CardDescription>
          Test arrows (<code className="text-xs">-&gt;</code>, <code className="text-xs">=&gt;</code>), case
          punctuation, and ligatures with <code className="text-xs">calt</code> on or off.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="context-text">Sample text</Label>
          <Textarea
            id="context-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="font-mono text-sm"
            aria-label="Editable contextual test text"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="calt-switch" checked={caltOn} onCheckedChange={setCaltOn} aria-label="Toggle calt" />
          <Label htmlFor="calt-switch">Contextual alternates (calt) enabled</Label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-muted-foreground text-[10px] uppercase">calt on</Label>
            <p className="text-xl leading-relaxed" style={withCalt}>
              {text}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-[10px] uppercase">calt off</Label>
            <p className="text-xl leading-relaxed" style={withoutCalt}>
              {text}
            </p>
          </div>
        </div>
        <CodeBlock
          code={
            caltOn
              ? `font-feature-settings: ${output};`
              : 'font-feature-settings: "calt" 0;'
          }
          label="Copy contextual settings"
        />
      </CardContent>
    </Card>
  )
}