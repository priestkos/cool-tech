import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  applySilhouettePreset,
  type LightPreset,
  type SilhouettePreset,
  type StudioState,
  mergeStudioState,
  resetStudioState,
} from "./state"

type Props = {
  state: StudioState
  onChange: (next: StudioState) => void
  onResetCamera: () => void
  reducedMotion: boolean
}

function fmt(n: number, digits = 2): string {
  return n.toFixed(digits)
}

function firstSliderValue(value: number | readonly number[]): number {
  if (typeof value === "number") return value
  return value[0] ?? 0
}

function ControlRow({
  id,
  label,
  valueLabel,
  children,
}: {
  id: string
  label: string
  valueLabel: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-xs font-medium">
          {label}
        </Label>
        <span className="tabular-nums text-[10px] text-muted-foreground">
          {valueLabel}
        </span>
      </div>
      {children}
    </div>
  )
}

export function StudioControls({
  state,
  onChange,
  onResetCamera,
  reducedMotion,
}: Props) {
  const patch = (partial: Partial<StudioState>) => {
    onChange(mergeStudioState(state, partial))
  }

  return (
    <div className="flex flex-col gap-3">
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Shape</CardTitle>
          <CardDescription className="text-xs">
            Silhouette and proportions (independent lathe approximation).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <ControlRow
            id="silhouette"
            label="Silhouette preset"
            valueLabel={state.silhouette}
          >
            <Select
              value={state.silhouette}
              onValueChange={(v) => {
                if (v) {
                  onChange(applySilhouettePreset(state, v as SilhouettePreset))
                }
              }}
            >
              <SelectTrigger id="silhouette" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="slim">Slim</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="tall">Tall</SelectItem>
              </SelectContent>
            </Select>
          </ControlRow>

          <ControlRow
            id="bodyWidth"
            label="Body width"
            valueLabel={fmt(state.bodyWidth)}
          >
            <Slider
              id="bodyWidth"
              min={0.55}
              max={1.45}
              step={0.01}
              value={[state.bodyWidth]}
              onValueChange={(v) => patch({ bodyWidth: firstSliderValue(v) })}
            />
          </ControlRow>

          <ControlRow
            id="shoulder"
            label="Shoulder curve"
            valueLabel={fmt(state.shoulder)}
          >
            <Slider
              id="shoulder"
              min={0.1}
              max={0.9}
              step={0.01}
              value={[state.shoulder]}
              onValueChange={(v) => patch({ shoulder: firstSliderValue(v) })}
            />
          </ControlRow>

          <ControlRow
            id="neckWidth"
            label="Neck width"
            valueLabel={fmt(state.neckWidth)}
          >
            <Slider
              id="neckWidth"
              min={0.18}
              max={0.55}
              step={0.01}
              value={[state.neckWidth]}
              onValueChange={(v) => patch({ neckWidth: firstSliderValue(v) })}
            />
          </ControlRow>

          <ControlRow id="height" label="Height" valueLabel={fmt(state.height)}>
            <Slider
              id="height"
              min={1.6}
              max={3.6}
              step={0.02}
              value={[state.height]}
              onValueChange={(v) => patch({ height: firstSliderValue(v) })}
            />
          </ControlRow>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Glass & fill</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <ControlRow
            id="glassHex"
            label="Glass tint"
            valueLabel={state.glassHex}
          >
            <Input
              id="glassHex"
              type="color"
              value={state.glassHex}
              onChange={(e) => patch({ glassHex: e.target.value })}
              className="h-9 w-full cursor-pointer p-1"
            />
          </ControlRow>
          <ControlRow
            id="glassOpacity"
            label="Glass opacity"
            valueLabel={fmt(state.glassOpacity)}
          >
            <Slider
              id="glassOpacity"
              min={0.08}
              max={0.85}
              step={0.01}
              value={[state.glassOpacity]}
              onValueChange={(v) => patch({ glassOpacity: firstSliderValue(v) })}
            />
          </ControlRow>
          <ControlRow
            id="fillHex"
            label="Fill color"
            valueLabel={state.fillHex}
          >
            <Input
              id="fillHex"
              type="color"
              value={state.fillHex}
              onChange={(e) => patch({ fillHex: e.target.value })}
              className="h-9 w-full cursor-pointer p-1"
            />
          </ControlRow>
          <ControlRow
            id="fillAmount"
            label="Fill level"
            valueLabel={`${Math.round(state.fillAmount * 100)}%`}
          >
            <Slider
              id="fillAmount"
              min={0}
              max={1}
              step={0.01}
              value={[state.fillAmount]}
              onValueChange={(v) => patch({ fillAmount: firstSliderValue(v) })}
            />
          </ControlRow>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Lighting</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <ControlRow
            id="lightPreset"
            label="Light preset"
            valueLabel={state.lightPreset}
          >
            <Select
              value={state.lightPreset}
              onValueChange={(v) => {
                if (v) patch({ lightPreset: v as LightPreset })
              }}
            >
              <SelectTrigger id="lightPreset" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cool">Cool</SelectItem>
                <SelectItem value="dramatic">Dramatic</SelectItem>
              </SelectContent>
            </Select>
          </ControlRow>
          <ControlRow
            id="lightIntensity"
            label="Key intensity"
            valueLabel={fmt(state.lightIntensity)}
          >
            <Slider
              id="lightIntensity"
              min={0.2}
              max={2.5}
              step={0.05}
              value={[state.lightIntensity]}
              onValueChange={(v) => patch({ lightIntensity: firstSliderValue(v) })}
            />
          </ControlRow>
          <ControlRow
            id="lightAzimuth"
            label="Light rotation"
            valueLabel={`${Math.round(state.lightAzimuth)}°`}
          >
            <Slider
              id="lightAzimuth"
              min={0}
              max={360}
              step={1}
              value={[state.lightAzimuth]}
              onValueChange={(v) => patch({ lightAzimuth: firstSliderValue(v) })}
            />
          </ControlRow>
          <ControlRow
            id="lightElevation"
            label="Light height"
            valueLabel={`${Math.round(state.lightElevation)}°`}
          >
            <Slider
              id="lightElevation"
              min={5}
              max={85}
              step={1}
              value={[state.lightElevation]}
              onValueChange={(v) => patch({ lightElevation: firstSliderValue(v) })}
            />
          </ControlRow>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Camera & brand</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <ControlRow
            id="cameraZoom"
            label="Camera zoom"
            valueLabel={fmt(state.cameraZoom)}
          >
            <Slider
              id="cameraZoom"
              min={0.6}
              max={1.8}
              step={0.02}
              value={[state.cameraZoom]}
              onValueChange={(v) => patch({ cameraZoom: firstSliderValue(v) })}
            />
          </ControlRow>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="autoRotate" className="text-xs">
              Auto-rotate preview
            </Label>
            <Switch
              id="autoRotate"
              checked={state.autoRotate && !reducedMotion}
              disabled={reducedMotion}
              onCheckedChange={(on) => patch({ autoRotate: on })}
            />
          </div>
          {reducedMotion ? (
            <p className="text-[10px] text-muted-foreground">
              Reduced motion is on — auto-rotation stays off.
            </p>
          ) : null}
          <ControlRow
            id="wordmark"
            label="Wordmark text"
            valueLabel={`${state.wordmark.length}/48`}
          >
            <Input
              id="wordmark"
              value={state.wordmark}
              maxLength={48}
              onChange={(e) => patch({ wordmark: e.target.value })}
            />
          </ControlRow>
          <ControlRow
            id="wordmarkScale"
            label="Wordmark size"
            valueLabel={fmt(state.wordmarkScale)}
          >
            <Slider
              id="wordmarkScale"
              min={0.5}
              max={2}
              step={0.05}
              value={[state.wordmarkScale]}
              onValueChange={(v) => patch({ wordmarkScale: firstSliderValue(v) })}
            />
          </ControlRow>
        </CardContent>
      </Card>

      <Separator />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange(resetStudioState())}
        >
          Reset all
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetCamera}
        >
          Reset camera
        </Button>
      </div>
    </div>
  )
}
