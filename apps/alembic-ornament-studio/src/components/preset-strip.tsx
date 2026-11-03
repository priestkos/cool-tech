import { FRAMES, PRESETS } from '@lauriparonen/alembic-ornaments'
import { OrnamentFrame, Ornament } from '@lauriparonen/alembic-ornaments/react'
import type { StudioState } from '@/lib/studio-state'

interface PresetStripProps {
  state: StudioState
  onSelectFrame: (preset: StudioState['framePreset']) => void
  onSelectDivider: (preset: StudioState['dividerPreset']) => void
}

export function PresetStrip({ state, onSelectFrame, onSelectDivider }: PresetStripProps) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
      <div>
        <h2 className="text-xs font-medium text-muted-foreground">Frames (seed {state.frameSeed})</h2>
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {FRAMES.map((frame) => (
            <li key={frame.id}>
              <button
                type="button"
                onClick={() => onSelectFrame(frame.id)}
                className={`flex w-full flex-col gap-1 rounded-md border p-2 text-left transition-colors ${
                  state.framePreset === frame.id
                    ? 'border-primary bg-background ring-2 ring-ring/30'
                    : 'border-border bg-background/80 hover:bg-muted'
                }`}
              >
                <div className="flex h-14 items-center justify-center overflow-hidden rounded bg-background text-[color:var(--ink-preview)]" style={{ ['--ink-preview' as string]: state.inkColor }}>
                  <OrnamentFrame
                    preset={frame.id}
                    seed={state.frameSeed}
                    aspect={4 / 3}
                    color={state.inkColor}
                    className="h-12 w-16"
                  />
                </div>
                <span className="text-[0.65rem] font-medium">{frame.label}</span>
                <span className="line-clamp-2 text-[0.6rem] text-muted-foreground">{frame.blurb}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xs font-medium text-muted-foreground">Divider ornaments (seed {state.dividerSeed})</h2>
        <ul className="mt-2 grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <li key={preset.id}>
              <button
                type="button"
                onClick={() => onSelectDivider(preset.id)}
                className={`flex w-full flex-col gap-1 rounded-md border p-2 text-left transition-colors ${
                  state.dividerPreset === preset.id
                    ? 'border-primary bg-background ring-2 ring-ring/30'
                    : 'border-border bg-background/80 hover:bg-muted'
                }`}
              >
                <div className="flex h-10 items-center justify-center overflow-hidden rounded bg-background" style={{ color: state.inkColor }}>
                  <Ornament preset={preset.id} seed={state.dividerSeed} color={state.inkColor} className="w-full max-w-[4.5rem]" />
                </div>
                <span className="text-[0.65rem] font-medium">{preset.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
