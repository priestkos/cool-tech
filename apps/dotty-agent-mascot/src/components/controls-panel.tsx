import {
  EXPRESSION_NAMES,
  SHAPE_NAMES,
  STATE_NAMES,
  type ExpressionName,
  type ShapeName,
  type StateName,
} from 'dotty-botty'
import { CopyIcon } from 'lucide-react'
import { buildDottyPropsSnippet } from '@/lib/dotty-props-snippet'
import { COLOR_PRESETS, type DottyVisualOptions } from '@/components/dotty-types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface ControlsPanelProps {
  consoleDriven: boolean
  onConsoleDrivenChange: (value: boolean) => void
  manualState: StateName
  onManualStateChange: (state: StateName) => void
  effectiveState: StateName
  options: DottyVisualOptions
  onOptionsChange: (patch: Partial<DottyVisualOptions>) => void
}

export function ControlsPanel({
  consoleDriven,
  onConsoleDrivenChange,
  manualState,
  onManualStateChange,
  effectiveState,
  options,
  onOptionsChange,
}: ControlsPanelProps) {
  const snippet = buildDottyPropsSnippet({
    state: effectiveState,
    shape: options.shape,
    expression: options.expression,
    size: options.size,
    ink: options.ink,
    spot: options.spot,
    followPointer: options.followPointer,
    reducedMotion: options.reducedMotion,
    pokeable: true,
  })

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controls</CardTitle>
        <CardDescription>
          Override Dotty manually or let the simulated console drive state.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="console-driven">Driven by console</Label>
            <p className="text-xs text-muted-foreground">
              Turn off to pick a state yourself.
            </p>
          </div>
          <Switch
            id="console-driven"
            checked={consoleDriven}
            onCheckedChange={onConsoleDrivenChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>State</Label>
          <Select
            value={consoleDriven ? effectiveState : manualState}
            disabled={consoleDriven}
            onValueChange={(value) => onManualStateChange(value as StateName)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATE_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Shape</Label>
            <Select
              value={options.shape}
              onValueChange={(value) =>
                onOptionsChange({ shape: value as ShapeName })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SHAPE_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Expression</Label>
            <Select
              value={options.expression ?? 'auto'}
              onValueChange={(value) =>
                onOptionsChange({
                  expression:
                    value === 'auto' ? null : (value as ExpressionName),
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="auto">auto (null)</SelectItem>
                  {EXPRESSION_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Color presets</Label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  onOptionsChange({ ink: preset.ink, spot: preset.spot })
                }
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ink">Ink</Label>
            <Input
              id="ink"
              type="color"
              value={options.ink}
              onChange={(event) =>
                onOptionsChange({ ink: event.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="spot">Spot</Label>
            <Input
              id="spot"
              type="color"
              value={options.spot}
              onChange={(event) =>
                onOptionsChange({ spot: event.target.value })
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Size ({options.size}px)</Label>
          <Slider
            min={64}
            max={220}
            step={4}
            value={[options.size]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (next != null) onOptionsChange({ size: next })
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="follow">Follow pointer</Label>
          <Switch
            id="follow"
            checked={options.followPointer}
            onCheckedChange={(checked) =>
              onOptionsChange({ followPointer: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="reduced">Reduced motion</Label>
          <Switch
            id="reduced"
            checked={options.reducedMotion}
            onCheckedChange={(checked) =>
              onOptionsChange({ reducedMotion: checked })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="snippet">Props snippet</Label>
            <Button type="button" size="sm" variant="secondary" onClick={copySnippet}>
              <CopyIcon data-icon="inline-start" />
              Copy
            </Button>
          </div>
          <Textarea
            id="snippet"
            readOnly
            className="font-mono text-xs"
            rows={8}
            value={snippet}
          />
        </div>
      </CardContent>
    </Card>
  )
}
