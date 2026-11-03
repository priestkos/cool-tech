import { Dices, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { FRAMES, PRESETS } from '@lauriparonen/alembic-ornaments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { StudioState } from '@/lib/studio-state'

const INK_SWATCHES = ['#1a1a1a', '#2c1810', '#1e3a5f', '#4a3728', '#0d3d3a', '#5c0032'] as const

interface ControlsPanelProps {
  state: StudioState
  onChange: (patch: Partial<StudioState>) => void
  onExportSvg: () => void
  onExportPng: (transparent: boolean) => void
}

export function ControlsPanel({ state, onChange, onExportSvg, onExportPng }: ControlsPanelProps) {
  const bumpSeed = (delta: number) => onChange({ frameSeed: Math.max(0, state.frameSeed + delta) })
  const randomSeed = () => onChange({ frameSeed: Math.floor(Math.random() * 10_000) })

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Controls</CardTitle>
        <p className="text-xs text-muted-foreground">
          “Density” here is honest frame weight: <code className="text-[0.65rem]">size</code> in px for{' '}
          <code className="text-[0.65rem]">fitFrame</code> / <code className="text-[0.65rem]">&lt;Framed&gt;</code> (12–64).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Frame preset</Label>
          <Select value={state.framePreset} onValueChange={(v) => onChange({ framePreset: v as StudioState['framePreset'] })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FRAMES.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {state.framePreset === 'corners' ? (
          <div className="space-y-2">
            <Label>Corners clear mode</Label>
            <div className="flex gap-2">
              {(['ink', 'edges'] as const).map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  size="sm"
                  variant={state.frameClear === mode ? 'default' : 'outline'}
                  onClick={() => onChange({ frameClear: mode })}
                >
                  {mode === 'ink' ? 'All ink' : 'Edges only'}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Seed</Label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="icon-sm" onClick={() => bumpSeed(-1)} aria-label="Previous seed">
              <ChevronLeft />
            </Button>
            <Input
              type="number"
              min={0}
              value={state.frameSeed}
              onChange={(e) => onChange({ frameSeed: Number.parseInt(e.target.value, 10) || 0 })}
              className="font-mono"
            />
            <Button type="button" variant="outline" size="icon-sm" onClick={() => bumpSeed(1)} aria-label="Next seed">
              <ChevronRight />
            </Button>
            <Button type="button" variant="outline" size="icon-sm" onClick={randomSeed} aria-label="Random seed">
              <Dices />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Frame weight (px)</Label>
            <span className="font-mono text-xs text-muted-foreground">{state.frameSize}px</span>
          </div>
          <Slider
            min={12}
            max={64}
            step={1}
            value={[state.frameSize]}
            onValueChange={(v) => {
              const next = Array.isArray(v) ? v[0] : v
              if (typeof next === 'number') onChange({ frameSize: next })
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Ink colour</Label>
          <div className="flex flex-wrap gap-2">
            {INK_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Ink ${c}`}
                className={`size-7 rounded-full border-2 ${state.inkColor === c ? 'border-primary' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                onClick={() => onChange({ inkColor: c })}
              />
            ))}
            <Input
              type="color"
              value={state.inkColor}
              onChange={(e) => onChange({ inkColor: e.target.value })}
              className="h-7 w-14 cursor-pointer p-0"
              aria-label="Custom ink colour"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Layout</Label>
          <div className="flex gap-2">
            {(['card', 'quote'] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={state.layout === mode ? 'default' : 'outline'}
                onClick={() => onChange({ layout: mode })}
              >
                {mode === 'card' ? 'Card' : 'Quote'}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{state.layout === 'card' ? 'Title' : 'Attribution'}</Label>
          <Input value={state.title} onChange={(e) => onChange({ title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>{state.layout === 'card' ? 'Body' : 'Quote text'}</Label>
          <Textarea value={state.body} onChange={(e) => onChange({ body: e.target.value })} rows={3} />
        </div>

        <div className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
          <div>
            <Label>Divider ornament</Label>
            <p className="text-[0.65rem] text-muted-foreground">{PRESETS.find((p) => p.id === state.dividerPreset)?.label}</p>
          </div>
          <Switch checked={state.dividerEnabled} onCheckedChange={(v) => onChange({ dividerEnabled: v })} />
        </div>

        {state.dividerEnabled ? (
          <div className="space-y-2">
            <Label>Divider seed</Label>
            <Input
              type="number"
              min={0}
              value={state.dividerSeed}
              onChange={(e) => onChange({ dividerSeed: Number.parseInt(e.target.value, 10) || 0 })}
            />
          </div>
        ) : null}

        <div className="space-y-2 border-t border-border pt-3">
          <Label>Export</Label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={onExportSvg}>
              <Download />
              SVG
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => onExportPng(false)}>
              PNG 2×
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => onExportPng(true)}>
              PNG 2× transparent
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
