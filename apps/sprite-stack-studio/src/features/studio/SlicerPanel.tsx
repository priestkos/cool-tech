import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export type SlicerFormState = {
  slices: number
  round: boolean
  colours: number
  advancedOpen: boolean
  order: "auto" | "reading"
  sideNose: "left" | "right"
  shade: number
  preview: boolean
  normals: boolean
  emissive: boolean
}

type Props = {
  form: SlicerFormState
  onChange: (next: SlicerFormState) => void
  onUpload: (file: File) => void
  busy: boolean
  error: string | null
}

export function SlicerPanel({ form, onChange, onUpload, busy, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Card className="border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Carve upload</CardTitle>
        <p className="text-xs text-muted-foreground">
          PNG 4-view sheet → real <code className="text-[10px]">views_to_slices.py</code>
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="slices">Slice count</Label>
            <Input
              id="slices"
              type="number"
              min={0}
              max={128}
              value={form.slices}
              onChange={(e) => onChange({ ...form, slices: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="colours">Palette</Label>
            <Input
              id="colours"
              type="number"
              min={0}
              max={256}
              value={form.colours}
              onChange={(e) => onChange({ ...form, colours: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
          <Label htmlFor="round" className="text-sm">
            Round carving
          </Label>
          <Switch
            id="round"
            checked={form.round}
            onCheckedChange={(round) => onChange({ ...form, round })}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="justify-start px-0 text-xs text-muted-foreground"
          onClick={() => onChange({ ...form, advancedOpen: !form.advancedOpen })}
        >
          {form.advancedOpen ? "Hide" : "Show"} advanced flags
        </Button>

        {form.advancedOpen && (
          <div className="flex flex-col gap-2 rounded-md border border-dashed border-border p-2">
            <div className="flex flex-col gap-1">
              <Label>View order</Label>
              <Select
                value={form.order}
                onValueChange={(order) => {
                  if (order === "auto" || order === "reading") onChange({ ...form, order })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">auto</SelectItem>
                  <SelectItem value="reading">reading</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Side nose</Label>
              <Select
                value={form.sideNose}
                onValueChange={(sideNose) => {
                  if (sideNose === "left" || sideNose === "right") onChange({ ...form, sideNose })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">left</SelectItem>
                  <SelectItem value="right">right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="shade">Shade</Label>
              <Input
                id="shade"
                type="number"
                step={0.05}
                min={0}
                max={1}
                value={form.shade}
                onChange={(e) => onChange({ ...form, shade: Number(e.target.value) })}
              />
            </div>
            {(
              [
                ["preview", "Preview sheet"],
                ["normals", "Normals strip"],
                ["emissive", "Emissive strip"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={form[key]}
                  onCheckedChange={(checked) => onChange({ ...form, [key]: checked })}
                />
              </div>
            ))}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ""
          }}
        />
        <Button type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "Carving…" : "Upload 4-view PNG"}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}