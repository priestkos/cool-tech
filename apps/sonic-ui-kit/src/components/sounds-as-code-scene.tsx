import { useMemo } from 'react'
import pebbleSource from '@/components/sounds/pebble.ts?raw'
import { Button } from '@/components/ui/button'
import { useMappedSound } from '@/context/sound-provider'

export function SoundsAsCodeScene() {
  const playPebble = useMappedSound('pebble')
  const lines = useMemo(() => pebbleSource.split('\n'), [pebbleSource])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3 text-left">
        <h3 className="text-lg font-medium">Sounds as code</h3>
        <p className="text-sm text-muted-foreground">
          React Bits Sound Lab installs each sound as a TypeScript{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">Recipe</code> — a
          declarative description of oscillators, noise, envelopes, and effects. Your app
          renders them at runtime with the shared Web Audio engine (
          <code className="rounded bg-muted px-1 py-0.5 text-xs">react-bits-sound.ts</code>
          ), so there are no checked-in WAV or MP3 assets.
        </p>
        <p className="text-sm text-muted-foreground">
          Install with the documented CLI, for example:{' '}
          <code className="block rounded-lg bg-muted p-2 text-xs">
            bunx shadcn@latest add @react-bits/SoundPebble-TS
          </code>
        </p>
        <Button type="button" onClick={playPebble}>Play Pebble recipe</Button>
      </div>
      <pre
        className="max-h-[420px] overflow-auto rounded-xl border bg-muted/40 p-4 text-left text-xs leading-relaxed"
        aria-label="Pebble sound recipe source"
      >
        <code>
          {lines.map((line, index) => (
            <div key={index}>
              <span className="mr-3 inline-block w-8 select-none text-right text-muted-foreground">
                {index + 1}
              </span>
              {line}
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}
