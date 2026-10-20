import type { ParamDef } from 'topographic'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface ParamControlProps {
  def: ParamDef
  value: number
  onChange: (value: number) => void
}

export function ParamControl({ def, value, onChange }: ParamControlProps) {
  const step = def.step
  const display =
    def.integer === true ? String(Math.round(value)) : value.toFixed(2)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium">{def.label}</Label>
        <span className="text-muted-foreground font-mono text-xs tabular-nums">
          {display}
        </span>
      </div>
      <Slider
        min={def.min}
        max={def.max}
        step={step}
        value={[value]}
        onValueChange={(v) => {
          const next = Array.isArray(v) ? v[0] : v
          onChange(next ?? def.default)
        }}
        aria-label={def.label}
      />
      <p className="text-muted-foreground text-[11px] leading-snug">
        {def.description}
      </p>
    </div>
  )
}
