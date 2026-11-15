import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { KnobDef, KnobValues, LoadTiming } from "./types"
import { meshModeLabel } from "./modes"
import type { PreviewMeshMode } from "./types"

type Props = {
  knobs: KnobDef[]
  values: KnobValues
  meshMode: PreviewMeshMode
  loadTiming: LoadTiming | null
  onChange: (key: string, value: string | number | boolean) => void
}

export function KnobPanel({ knobs, values, meshMode, loadTiming, onChange }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Knobs</CardTitle>
        <p className="text-xs text-muted-foreground">
          Schema-driven controls · {meshModeLabel(meshMode)}
          {loadTiming ? (
            <span className="ml-1 text-foreground">
              · load {loadTiming.ms} ms ({loadTiming.label})
            </span>
          ) : null}
        </p>
      </CardHeader>
      <CardContent className="grid max-h-64 gap-3 overflow-y-auto">
        {knobs.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No param schema bundled for this model in offline mode. Select A-Frame
            Cabin or enable Live Polyfork CDN.
          </p>
        ) : (
          knobs.map((knob) => (
            <KnobControl
              key={knob.key}
              knob={knob}
              value={values[knob.key] ?? knob.default}
              onChange={onChange}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function KnobControl({
  knob,
  value,
  onChange,
}: {
  knob: KnobDef
  value: string | number | boolean
  onChange: (key: string, value: string | number | boolean) => void
}) {
  const id = `knob-${knob.key}`
  switch (knob.kind) {
    case "choice":
      return (
        <div className="grid gap-1">
          <Label htmlFor={id}>{knob.label}</Label>
          <Select
            value={String(value)}
            onValueChange={(v) => v != null && onChange(knob.key, v)}
          >
            <SelectTrigger id={id}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(knob.options ?? []).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    case "range":
      return (
        <div className="grid gap-1">
          <Label htmlFor={id}>
            {knob.label}{" "}
            <span className="text-muted-foreground">({String(value)})</span>
          </Label>
          <Input
            id={id}
            type="range"
            min={knob.min ?? 0}
            max={knob.max ?? 1}
            step={knob.step ?? 0.1}
            value={Number(value)}
            onChange={(e) => onChange(knob.key, Number(e.target.value))}
          />
        </div>
      )
    case "toggle":
      return (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={id}>{knob.label}</Label>
          <Switch
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(v) => onChange(knob.key, v)}
          />
        </div>
      )
    case "color":
      return (
        <div className="grid gap-1">
          <Label htmlFor={id}>{knob.label}</Label>
          <div className="flex gap-2">
            <Input
              id={id}
              type="color"
              value={String(value)}
              onChange={(e) => onChange(knob.key, e.target.value)}
              className="h-9 w-14 p-1"
            />
            <Input
              value={String(value)}
              onChange={(e) => onChange(knob.key, e.target.value)}
              aria-label={`${knob.label} hex`}
            />
          </div>
        </div>
      )
    default:
      return null
  }
}

export function SnippetCard({
  text,
  onCopy,
}: {
  text: string
  onCopy: () => void
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">Copy snippet</CardTitle>
        <Button type="button" size="sm" variant="secondary" onClick={onCopy}>
          Copy
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="max-h-32 overflow-auto rounded-md bg-muted p-2 text-[10px] leading-relaxed whitespace-pre-wrap">
          {text}
        </pre>
      </CardContent>
    </Card>
  )
}