import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { GlassLogoReveal } from '@/components/GlassLogoReveal'
import { RendererBadge } from '@/components/RendererBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Toaster } from '@/components/ui/sonner'
import { isWebGL2Available } from '@/glass/renderer'
import { PRESET_LIST, type PresetId } from '@/glass/presets'
import type { LogoTextures } from '@/glass/sdf'
import { logoFromFile, logoFromPreset } from '@/glass/sdf'
import {
  DEFAULT_STUDIO_SETTINGS,
  glassParamsFromStudio,
  studioSettingsToJson,
  type StudioSettings,
} from '@/glass/settings'


function App() {
  const webgl = isWebGL2Available()
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS)
  const [logo, setLogo] = useState<LogoTextures | null>(null)
  const [playing, setPlaying] = useState(true)
  const [time, setTime] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [rendererKind, setRendererKind] = useState<'webgl2' | 'static'>(
    webgl ? 'webgl2' : 'static',
  )
  const fileRef = useRef<HTMLInputElement>(null)

  const params = useMemo(() => glassParamsFromStudio(settings), [settings])

  const loadPreset = useCallback(async (presetId: PresetId) => {
    try {
      const textures = await logoFromPreset(presetId)
      setLogo(textures)
      setSettings((s) => ({ ...s, presetId }))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load preset')
    }
  }, [])

  useEffect(() => {
    void loadPreset('diamond')
  }, [loadPreset])

  useEffect(() => {
    if (!playing) return
    const loopEnd = params.present + 0.95
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setTime((t) => {
        const next = t + dt
        return next > loopEnd ? 0 : next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, params.present])

  const replay = () => {
    setTime(0)
    setPlaying(true)
  }

  const onLookChange = (look: 'light' | 'dark') => {
    setSettings((s) => ({
      ...s,
      look,
      presetId: look === 'dark' && s.presetId === 'diamond' ? 'ring' : s.presetId,
    }))
    if (look === 'dark' && settings.presetId === 'diamond') {
      void loadPreset('ring')
    }
  }

  const onFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    try {
      const textures = await logoFromFile(file)
      setLogo(textures)
      setSettings((s) => ({ ...s, originalColors: true }))
      replay()
      toast.success(`Loaded ${file.name}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    }
  }

  const copySettings = async () => {
    try {
      await navigator.clipboard.writeText(studioSettingsToJson(settings))
      toast.success('Settings copied as JSON')
    } catch {
      toast.error('Could not copy settings')
    }
  }

  const patch = (partial: Partial<StudioSettings>) => setSettings((s) => ({ ...s, ...partial }))

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Glass Logo Reveal</h1>
          <p className="text-muted-foreground text-xs">Liquid-glass logo reveal studio (WebGL 2)</p>
        </div>
        <RendererBadge kind={rendererKind} />
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <section
          className={`relative min-h-[320px] flex-1 ${dragOver ? 'ring-2 ring-primary ring-inset' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            void onFiles(e.dataTransfer.files)
          }}
        >
          <GlassLogoReveal
            logo={logo}
            params={params}
            time={time}
            onReplay={replay}
            onRendererKind={setRendererKind}
            className="absolute inset-0 h-full w-full touch-none"
          />
          <p className="pointer-events-none absolute top-3 left-3 rounded-full bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            Double-click stage to replay · Drop SVG/PNG
          </p>
        </section>

        <aside className="w-full border-t border-border/60 p-4 lg:w-96 lg:border-t-0 lg:border-l">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-base">Controls</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 px-0">
              <div className="space-y-2">
                <Label>Look</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={settings.look === 'light' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => onLookChange('light')}
                  >
                    Light glass
                  </Button>
                  <Button
                    size="sm"
                    variant={settings.look === 'dark' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => onLookChange('dark')}
                  >
                    Dark glass
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_LIST.map((p) => (
                    <Button
                      key={p.id}
                      size="sm"
                      variant={settings.presetId === p.id ? 'default' : 'outline'}
                      onClick={() => void loadPreset(p.id)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => void onFiles(e.target.files)}
                />
                <Button size="sm" variant="secondary" className="w-full" onClick={() => fileRef.current?.click()}>
                  Upload SVG or PNG
                </Button>
              </div>

              <ControlSlider
                label="Refraction (optical depth)"
                value={settings.opticalDepth}
                min={0}
                max={3}
                step={0.05}
                onChange={(v) => patch({ opticalDepth: v })}
              />
              <ControlSlider
                label="Edge smear"
                value={settings.edgeSmear}
                min={0}
                max={3}
                step={0.05}
                onChange={(v) => patch({ edgeSmear: v })}
              />
              <ControlSlider
                label="Rim light"
                value={settings.specular}
                min={0}
                max={2}
                step={0.05}
                onChange={(v) => patch({ specular: v })}
              />
              <ControlSlider
                label="Bubble response (s)"
                value={settings.response}
                min={0.25}
                max={1.2}
                step={0.01}
                onChange={(v) => patch({ response: v })}
              />
              <ControlSlider
                label="Hold in glass (s)"
                value={settings.present}
                min={0.5}
                max={2.5}
                step={0.05}
                onChange={(v) => patch({ present: v })}
              />

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setPlaying((p) => !p)}>
                  {playing ? 'Pause' : 'Play'}
                </Button>
                <Button size="sm" variant="outline" onClick={replay}>Replay</Button>
                <Button size="sm" variant="secondary" onClick={() => void copySettings()}>
                  Copy settings as JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <footer className="border-t border-border/60 px-4 py-3 text-center text-xs text-muted-foreground">
        Shader and motion ported from{' '}
        <a
          href="https://github.com/zanwei/glass-icon-reveal"
          className="underline underline-offset-2 hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          glass-icon-reveal
        </a>{' '}
        (MIT) · Inspired by{' '}
        <a
          href="https://x.com/zanwei_guo/status/2113506406418780663"
          className="underline underline-offset-2 hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          @zanwei_guo
        </a>
      </footer>
      <Toaster />
    </div>
  )
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-muted-foreground text-xs tabular-nums">{value.toFixed(2)}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => {
          const next = Array.isArray(v) ? v[0] : v
          if (typeof next === 'number') onChange(next)
        }}
      />
    </div>
  )
}

export default App
