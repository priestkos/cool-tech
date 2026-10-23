import { LOOKS, SHAPES, paramsIn } from 'topographic'
import { ParamControl } from '@/components/ParamControl'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CAMERA_MOTION_OPTIONS,
  REAL_PLACE_PRESETS,
  patchForRealPlace,
  type StudioState,
} from '@/lib/studio-settings'

interface ControlPanelProps {
  state: StudioState
  onChange: (patch: Partial<StudioState>) => void
}

export function ControlPanel({ state, onChange }: ControlPanelProps) {
  const lineParams = paramsIn('lines')
  const terrainParams = paramsIn('terrain')
  const motionParams = paramsIn('motion')
  const layoutParams = paramsIn('layout')

  const setLine = (key: keyof StudioState['lines'], value: number) =>
    onChange({ lines: { ...state.lines, [key]: value } })
  const setTerrain = (key: keyof StudioState['terrain'], value: number) =>
    onChange({ terrain: { ...state.terrain, [key]: value } })
  const setMotion = (key: keyof StudioState['motion'], value: number) =>
    onChange({ motion: { ...state.motion, [key]: value } })
  const setLayout = (key: keyof StudioState['layout'], value: number) =>
    onChange({ layout: { ...state.layout, [key]: value } })

  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 p-4 pr-5">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Source</h2>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Pick a real place from elevation data bundled in topographic, or
            generate procedural terrain from a shape and seed.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Real places</Label>
          <div className="flex flex-wrap gap-2">
            {REAL_PLACE_PRESETS.map((preset) => (
              <button
                key={preset.location}
                type="button"
                className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                  state.location === preset.location
                    ? 'border-primary bg-primary/15 font-medium'
                    : 'border-border bg-muted/40 hover:bg-muted'
                }`}
                onClick={() => onChange(patchForRealPlace(preset.location))}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {state.location ? (
            <button
              type="button"
              className="text-muted-foreground text-xs underline-offset-2 hover:underline"
              onClick={() => onChange({ location: null })}
            >
              Use procedural terrain instead
            </button>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Shape</Label>
          <Select
            value={state.shape}
            disabled={state.location !== null}
            onValueChange={(v) =>
              onChange({ shape: v as StudioState['shape'], location: null })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHAPES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seed">Seed</Label>
          <Input
            id="seed"
            type="number"
            min={0}
            max={999999}
            disabled={state.location !== null}
            value={state.seed}
            onChange={(e) =>
              onChange({ seed: Number.parseInt(e.target.value, 10) || 0 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Curated looks</Label>
          <div className="flex flex-wrap gap-2">
            {LOOKS.map((look) => (
              <button
                key={look.id}
                type="button"
                className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs transition-colors hover:bg-muted"
                onClick={() => {
                  const s = look.settings
                  onChange({
                    location: null,
                    shape: (s.shape ?? state.shape) as StudioState['shape'],
                    seed: s.seed ?? state.seed,
                    lines: { ...state.lines, ...s.lines },
                    terrain: { ...state.terrain, ...s.terrain },
                    motion: { ...state.motion, ...s.motion },
                    layout: { ...state.layout, ...s.layout },
                    theme: { ...state.theme, ...s.theme },
                    mode: s.mode ?? state.mode,
                    elevation: s.elevation ?? state.elevation,
                    camera: { ...state.camera, ...s.camera },
                  })
                }}
              >
                {look.name}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Contour lines
          </h3>
          <div className="mt-3 space-y-4">
            {lineParams.map((def) => (
              <ParamControl
                key={def.key}
                def={def}
                value={state.lines[def.key as keyof StudioState['lines']]}
                onChange={(v) =>
                  setLine(def.key as keyof StudioState['lines'], v)
                }
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Terrain
          </h3>
          <div className="mt-3 space-y-4">
            {terrainParams.map((def) => (
              <ParamControl
                key={def.key}
                def={def}
                value={state.terrain[def.key as keyof StudioState['terrain']]}
                onChange={(v) =>
                  setTerrain(def.key as keyof StudioState['terrain'], v)
                }
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Motion
          </h3>
          <div className="mt-3 space-y-4">
            {motionParams.map((def) => (
              <ParamControl
                key={def.key}
                def={def}
                value={state.motion[def.key as keyof StudioState['motion']]}
                onChange={(v) =>
                  setMotion(def.key as keyof StudioState['motion'], v)
                }
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Layout
          </h3>
          <div className="mt-3 space-y-4">
            {layoutParams.map((def) => (
              <ParamControl
                key={def.key}
                def={def}
                value={state.layout[def.key as keyof StudioState['layout']]}
                onChange={(v) =>
                  setLayout(def.key as keyof StudioState['layout'], v)
                }
              />
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            3D &amp; theme
          </h3>
          <ParamControl
            def={{
              group: 'terrain',
              key: 'elevation',
              label: 'Elevation exaggeration',
              description: 'How tall the 3D terrain rises above the paper.',
              min: 0,
              max: 1,
              step: 0.01,
              default: 0.62,
              attr: 'elevation',
              short: 'ev',
              slot: 0,
            }}
            value={state.elevation}
            onChange={(v) => onChange({ elevation: v })}
          />
          <ParamControl
            def={{
              group: 'terrain',
              key: 'detail',
              label: 'Mesh detail',
              description: 'Finer mesh for smoother slopes in 3D.',
              min: 0,
              max: 1,
              step: 0.01,
              default: 0.5,
              attr: 'detail',
              short: 'dl',
              slot: 0,
            }}
            value={state.detail}
            onChange={(v) => onChange({ detail: v })}
          />
          <div className="space-y-2">
            <Label>Camera motion</Label>
            <Select
              value={state.camera.motion}
              onValueChange={(v) =>
                onChange({
                  camera: {
                    ...state.camera,
                    motion: v as StudioState['camera']['motion'],
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMERA_MOTION_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ParamControl
            def={{
              group: 'layout',
              key: 'camElev',
              label: 'Camera elevation',
              description: 'Viewing angle above the horizon (degrees).',
              min: 5,
              max: 85,
              step: 1,
              default: 33,
              integer: true,
              attr: 'camera-elevation',
              short: 'ce',
              slot: 0,
            }}
            value={state.camera.elevation}
            onChange={(v) =>
              onChange({ camera: { ...state.camera, elevation: v } })
            }
          />
          <ParamControl
            def={{
              group: 'layout',
              key: 'camRadius',
              label: 'Camera distance',
              description: 'Smaller values move the camera closer.',
              min: 0.8,
              max: 4,
              step: 0.05,
              default: 1.92,
              attr: 'camera-radius',
              short: 'rd',
              slot: 0,
            }}
            value={state.camera.radius}
            onChange={(v) =>
              onChange({ camera: { ...state.camera, radius: v } })
            }
          />
          <div className="space-y-2">
            <Label>Theme mode</Label>
            <Select
              value={state.theme.mode}
              onValueChange={(v) =>
                onChange({
                  theme: { ...state.theme, mode: v as StudioState['theme']['mode'] },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ink">Ink</Label>
              <Input
                id="ink"
                value={state.theme.ink}
                onChange={(e) =>
                  onChange({ theme: { ...state.theme, ink: e.target.value } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paper">Paper</Label>
              <Input
                id="paper"
                value={state.theme.paper}
                onChange={(e) =>
                  onChange({ theme: { ...state.theme, paper: e.target.value } })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
