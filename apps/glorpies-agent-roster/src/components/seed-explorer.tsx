import { FULL_LOOKS, SHAPES, seedOf, randomName, STATES, type FaceState, type LookChoice, type Shape } from "glorpies"
import { Glorpie } from "glorpies/react"
import { Download, Plus, Shuffle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ExplorerState } from "@/lib/app-state"
import type { RosterAgent } from "@/lib/agent-state-machine"
import { parseSeedInput, toggleSeedMode } from "@/lib/seed-input"
import {
  assertSvgWellFormed,
  buildExportFileName,
  createSvgBlob,
  exportPngCanvas,
  exportSvgString,
  triggerDownload,
} from "@/lib/export-face"

type SeedExplorerProps = {
  explorer: ExplorerState
  onChange: (patch: Partial<ExplorerState>) => void
  onAddToRoster: (agent: RosterAgent) => void
}

export function SeedExplorer({ explorer, onChange, onAddToRoster }: SeedExplorerProps) {
  const parsed = parseSeedInput(explorer.rawInput, explorer.seedMode)
  const seedValue = seedOf(parsed.name)

  const stillOptions = {
    look: explorer.look,
    shape: explorer.shape,
    background: explorer.background,
    size: 128,
  } as const

  const exportSvg = () => {
    const svg = exportSvgString(parsed.name, { ...stillOptions, state: "idle" })
    if (!assertSvgWellFormed(svg)) {
      toast.error("SVG export failed validation")
      return
    }
    triggerDownload(createSvgBlob(svg), buildExportFileName(parsed.display, "svg"))
    toast.success("SVG downloaded")
  }

  const exportPng = async () => {
    const canvas = exportPngCanvas(parsed.name, { ...stillOptions, state: "idle" })
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png")
    })
    if (!blob) {
      toast.error("PNG export failed")
      return
    }
    triggerDownload(blob, buildExportFileName(parsed.display, "png"))
    toast.success("PNG downloaded")
  }

  const addAgent = () => {
    const id = `custom-${Date.now()}`
    const name =
      typeof parsed.name === "number" ? String(parsed.name) : parsed.name
    onAddToRoster({
      id,
      name,
      role: "Explorer",
      task: "Spawned from seed explorer",
    })
    toast.success(`Added ${name} to roster`)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Seed explorer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="seed-input">Name or seed</Label>
            <Input
              id="seed-input"
              value={explorer.rawInput}
              onChange={(event) => onChange({ rawInput: event.target.value })}
              placeholder={explorer.seedMode === "number" ? "42" : "agent-47"}
            />
          </div>
          <div className="space-y-2">
            <Label>Input mode</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={explorer.seedMode === "string" ? "default" : "outline"}
                onClick={() => onChange({ seedMode: "string" })}
              >
                String
              </Button>
              <Button
                type="button"
                size="sm"
                variant={explorer.seedMode === "number" ? "default" : "outline"}
                onClick={() => onChange({ seedMode: "number" })}
              >
                Number
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">seedOf = {seedValue}</Badge>
          <Badge variant="outline">
            face name: {typeof parsed.name === "number" ? parsed.name : `"${parsed.name}"`}
          </Badge>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange({ seedMode: toggleSeedMode(explorer.seedMode) })}
          >
            Toggle mode
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange({ rawInput: randomName() })}
          >
            <Shuffle className="size-4" /> Random name
          </Button>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/20 p-4">
          <Glorpie
            name={parsed.name}
            size={128}
            look={explorer.look}
            shape={explorer.shape}
            background={explorer.background}
            state="idle"
            label={`Preview ${parsed.display}`}
            pokeable
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm">All states</Label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {STATES.map((state: FaceState) => (
              <div key={state} className="flex flex-col items-center gap-1 text-xs">
                <Glorpie
                  name={parsed.name}
                  size={56}
                  state={state}
                  look={explorer.look}
                  shape={explorer.shape}
                  background={explorer.background}
                  label={`${parsed.display} ${state}`}
                />
                <span className="text-muted-foreground">{state}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label>Look</Label>
            <ScrollArea className="h-36 rounded-md border p-2">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {(["auto", ...FULL_LOOKS.map((l) => l.id)] as LookChoice[]).map((look) => (
                  <Button
                    key={look}
                    type="button"
                    size="sm"
                    variant={explorer.look === look ? "default" : "outline"}
                    className="h-auto flex-col py-2 text-xs"
                    onClick={() => onChange({ look })}
                  >
                    <Glorpie name={parsed.name} size={32} look={look} state="idle" label={look} />
                    {look}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Shape</Label>
              <Select
                value={explorer.shape}
                onValueChange={(value) => onChange({ shape: value as Shape })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHAPES.map((shape) => (
                    <SelectItem key={shape} value={shape}>
                      {shape}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Background</Label>
              <Select
                value={String(explorer.background)}
                onValueChange={(value) => {
                  if (!value) return
                  if (value === "true") onChange({ background: true })
                  else if (value === "false") onChange({ background: false })
                  else onChange({ background: value })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Paper (default)</SelectItem>
                  <SelectItem value="false">Transparent</SelectItem>
                  <SelectItem value="#ffe9a8">Warm yellow</SelectItem>
                  <SelectItem value="#1e293b">Slate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={exportSvg}>
            <Download className="size-4" /> Export SVG
          </Button>
          <Button type="button" variant="secondary" onClick={() => void exportPng()}>
            <Download className="size-4" /> Export PNG
          </Button>
          <Button type="button" onClick={addAgent}>
            <Plus className="size-4" /> Add to roster
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
