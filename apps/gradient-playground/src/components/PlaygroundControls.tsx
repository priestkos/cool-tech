import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  HERO_CATALOG,
  type HeroComponentId,
  type ControlState,
} from '@/lib/playground-catalog'

function ColorField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <input
        type="color"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="size-8 cursor-pointer rounded-md border border-border bg-transparent p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={label}
      />
    </div>
  )
}

export function PlaygroundControls({
  componentId,
  controls,
  useThemeColors,
  onComponentId,
  onControls,
  onUseThemeColors,
}: {
  componentId: HeroComponentId
  controls: ControlState
  useThemeColors: boolean
  onComponentId: (id: HeroComponentId) => void
  onControls: (patch: Partial<ControlState>) => void
  onUseThemeColors: (value: boolean) => void
}) {
  const entry = HERO_CATALOG.find((item) => item.id === componentId)

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 p-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Background component</Label>
          <Tabs
            value={componentId}
            onValueChange={(value) => onComponentId(value as HeroComponentId)}
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted/60 p-1">
              {HERO_CATALOG.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="text-xs">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {entry ? (
            <p className="text-muted-foreground text-xs leading-relaxed">{entry.description}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
          <div className="space-y-0.5">
            <Label htmlFor="theme-colors" className="text-sm">Theme palette</Label>
            <p className="text-muted-foreground text-xs">
              Use CSS variables so colours follow light/dark mode.
            </p>
          </div>
          <Switch
            id="theme-colors"
            checked={useThemeColors}
            onCheckedChange={onUseThemeColors}
          />
        </div>

        <div className="space-y-4">
          <ControlSlider
            label="Speed"
            value={controls.speed}
            min={0}
            max={2}
            step={0.05}
            onChange={(value) => onControls({ speed: value })}
          />
          <ControlSlider
            label="Grain"
            value={controls.grain}
            min={0}
            max={1}
            step={0.02}
            onChange={(value) => onControls({ grain: value })}
          />
          <ControlSlider
            label="Blur"
            value={controls.blur}
            min={0}
            max={1}
            step={0.02}
            onChange={(value) => onControls({ blur: value })}
          />
          <ControlSlider
            label="Scale"
            value={controls.scale}
            min={0.25}
            max={4}
            step={0.05}
            onChange={(value) => onControls({ scale: value })}
          />
          <ControlSlider
            label="Warp"
            value={controls.warp}
            min={0}
            max={1}
            step={0.02}
            onChange={(value) => onControls({ warp: value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Custom colours</Label>
          <div className="grid gap-2">
            <ColorField
              label="Stop 1"
              value={controls.color1}
              disabled={useThemeColors}
              onChange={(value) => onControls({ color1: value })}
            />
            <ColorField
              label="Stop 2"
              value={controls.color2}
              disabled={useThemeColors}
              onChange={(value) => onControls({ color2: value })}
            />
            <ColorField
              label="Stop 3"
              value={controls.color3}
              disabled={useThemeColors}
              onChange={(value) => onControls({ color3: value })}
            />
            <ColorField
              label="Stop 4"
              value={controls.color4}
              disabled={useThemeColors}
              onChange={(value) => onControls({ color4: value })}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <Label>{label}</Label>
        <span className="tabular-nums text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => {
          const next = Array.isArray(values) ? values[0] : values
          onChange(typeof next === 'number' ? next : value)
        }}
      />
    </div>
  )
}
