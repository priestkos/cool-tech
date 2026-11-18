import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { SceneDocument, ToneMappingMode } from "@/features/scene/document"

type Props = {
  doc: SceneDocument
  jsonText: string
  parseErrors: string[]
  onJsonChange: (text: string) => void
  onApplyJson: () => void
  onSunPatch: (patch: Partial<SceneDocument["environment"]["sun"]>) => void
  onPreviewPatch: (patch: Partial<SceneDocument["preview"]>) => void
}

const toneOptions: ToneMappingMode[] = ["aces", "reinhard", "linear", "none"]

export function EditorPanel({
  doc,
  jsonText,
  parseErrors,
  onJsonChange,
  onApplyJson,
  onSunPatch,
  onPreviewPatch,
}: Props) {
  const sun = doc.environment.sun

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Sun & sky</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="sun-azimuth">Azimuth ({sun.azimuthDeg.toFixed(0)}°)</Label>
            <Slider
              id="sun-azimuth"
              min={0}
              max={360}
              value={[sun.azimuthDeg]}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v
                onSunPatch({ azimuthDeg: typeof n === "number" ? n : sun.azimuthDeg })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sun-elevation">Elevation ({sun.elevationDeg.toFixed(0)}°)</Label>
            <Slider
              id="sun-elevation"
              min={-10}
              max={85}
              value={[sun.elevationDeg]}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v
                onSunPatch({
                  elevationDeg: typeof n === "number" ? n : sun.elevationDeg,
                })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sun-lux">Illuminance (lux)</Label>
            <Input
              id="sun-lux"
              type="number"
              inputMode="decimal"
              value={sun.illuminanceLux}
              onChange={(e) =>
                onSunPatch({ illuminanceLux: Number(e.target.value) || 0 })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Raster preview (three.js)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="space-y-2">
            <Label htmlFor="exposure">Exposure ({doc.preview.exposure.toFixed(2)})</Label>
            <Slider
              id="exposure"
              min={0.25}
              max={2.5}
              step={0.05}
              value={[doc.preview.exposure]}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v
                onPreviewPatch({
                  exposure: typeof n === "number" ? n : doc.preview.exposure,
                })
              }}
            />
          </div>
          <ToneMappingSelect
            value={doc.preview.toneMapping}
            onChange={(toneMapping: ToneMappingMode) =>
              onPreviewPatch({ toneMapping })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Scene JSON (lab v2 → @threert/scene)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <textarea
            id="scene-json"
            className="min-h-[180px] w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-[11px] leading-relaxed focus-visible:ring-2 focus-visible:ring-ring"
            value={jsonText}
            onChange={(e) => onJsonChange(e.target.value)}
            spellCheck={false}
            aria-describedby={parseErrors.length ? "json-errors" : undefined}
          />
          {parseErrors.length > 0 && (
            <ul
              id="json-errors"
              className="list-disc space-y-0.5 pl-4 text-xs text-destructive"
            >
              {parseErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
          <Button type="button" onClick={onApplyJson} className="w-full">
            Apply JSON to preview
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ToneMappingSelect({
  value,
  onChange,
}: {
  value: ToneMappingMode
  onChange: (v: ToneMappingMode) => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor="tone-map">Tone mapping</Label>
      <select
        id="tone-map"
        className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(e) => onChange(e.target.value as ToneMappingMode)}
      >
        {toneOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}