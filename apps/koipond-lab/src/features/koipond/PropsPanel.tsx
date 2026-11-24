import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LookPicker } from "./LookPicker"
import type { PondLab } from "./usePondLab"
import type { PondLook } from "./defaults"

type Props = {
  lab: PondLab
}

function LabSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (n: number) => void
  format?: (n: number) => string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-muted-foreground font-mono text-xs tabular-nums">
          {format ? format(value) : value}
        </span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => {
          const n = Array.isArray(v) ? v[0] : v
          if (typeof n === "number") onChange(n)
        }}
        aria-label={label}
      />
    </div>
  )
}

export function PropsPanel({ lab }: Props) {
  const { state, patch, setLook, setWater } = lab

  return (
    <div className="space-y-5">
      <LookPicker value={state.look} onChange={(look: PondLook) => setLook(look)} />

      <Separator />

      <div className="grid gap-4">
        <LabSlider
          id="fish"
          label="fish"
          value={state.fish}
          min={0}
          max={24}
          step={1}
          onChange={(fish) => patch({ fish })}
        />
        <LabSlider
          id="fishSize"
          label="fishSize"
          value={state.fishSize}
          min={0.08}
          max={0.35}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(fishSize) => patch({ fishSize })}
        />
        <LabSlider
          id="pads"
          label="pads"
          value={state.pads}
          min={0}
          max={12}
          step={1}
          onChange={(pads) => patch({ pads })}
        />
        <LabSlider
          id="petals"
          label="petals"
          value={state.petals}
          min={0}
          max={30}
          step={1}
          onChange={(petals) => patch({ petals })}
        />
        <LabSlider
          id="minnows"
          label="minnows"
          value={state.minnows}
          min={0}
          max={12}
          step={1}
          onChange={(minnows) => patch({ minnows })}
        />
        <LabSlider
          id="rain"
          label="rain"
          value={state.rain}
          min={0}
          max={1}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={(rain) => patch({ rain })}
        />
        <LabSlider
          id="seed"
          label="seed"
          value={state.seed}
          min={0}
          max={99}
          step={1}
          onChange={(seed) => patch({ seed })}
        />
        <LabSlider
          id="scale"
          label="scale"
          value={state.scale}
          min={0.35}
          max={1.5}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={(scale) => patch({ scale })}
        />
      </div>

      <Separator />

      <div className="grid gap-3">
        {(
          [
            ["border", "border"],
            ["cursor", "cursor"],
            ["scrollCurrent", "scrollCurrent"],
            ["interactive", "interactive"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <Label htmlFor={key} className="font-mono text-xs">
              {label}
            </Label>
            <Switch
              id={key}
              checked={state[key]}
              onCheckedChange={(checked) => patch({ [key]: checked })}
              aria-label={label}
            />
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="water-override" className="text-sm">
            water override
          </Label>
          <Switch
            id="water-override"
            checked={state.waterOverrideEnabled}
            onCheckedChange={(waterOverrideEnabled) => patch({ waterOverrideEnabled })}
            aria-label="Enable water colour and light overrides"
          />
        </div>
        {state.waterOverrideEnabled ? (
          <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="grid gap-2">
              <Label htmlFor="shallow">shallow</Label>
              <Input
                id="shallow"
                value={state.water.shallow ?? ""}
                placeholder="#5aa8a0"
                onChange={(e) => setWater({ shallow: e.target.value || undefined })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deep">deep</Label>
              <Input
                id="deep"
                value={state.water.deep ?? ""}
                placeholder="#1a4a52"
                onChange={(e) => setWater({ deep: e.target.value || undefined })}
              />
            </div>
            <LabSlider
              id="caustics"
              label="caustics"
              value={state.water.caustics ?? 1}
              min={0}
              max={2}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={(caustics) => setWater({ caustics })}
            />
            <LabSlider
              id="waves"
              label="waves"
              value={state.water.waves ?? 1}
              min={0}
              max={2}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={(waves) => setWater({ waves })}
            />
            <LabSlider
              id="clarity"
              label="clarity"
              value={state.water.clarity ?? 1}
              min={0}
              max={2}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={(clarity) => setWater({ clarity })}
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">
            Uses colours from the active <code className="text-[0.7rem]">look</code> until
            override is on.
          </p>
        )}
      </div>

      <Button type="button" variant="secondary" className="w-full" onClick={() => lab.reset()}>
        Reset to package defaults
      </Button>
    </div>
  )
}