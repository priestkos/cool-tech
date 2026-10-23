import { useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { GallerySection } from '@/components/GallerySection'
import { HeroStage } from '@/components/HeroStage'
import { PlaygroundControls } from '@/components/PlaygroundControls'
import { RendererBadge } from '@/components/RendererBadge'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { installCommand } from '@/lib/install-command'
import {
  catalogById,
  controlsToGradientProps,
  DEFAULT_CONTROLS,
  type ControlState,
  type HeroComponentId,
} from '@/lib/playground-catalog'

function App() {
  const { resolvedTheme, setTheme } = useTheme()
  const [componentId, setComponentId] = useState<HeroComponentId>('mesh-gradient')
  const [controls, setControls] = useState<ControlState>(DEFAULT_CONTROLS)
  const [useThemeColors, setUseThemeColors] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)

  const entry = catalogById(componentId)
  const gradientProps = useMemo(
    () => controlsToGradientProps(controls, useThemeColors),
    [controls, useThemeColors],
  )

  const copyInstall = async () => {
    const command = installCommand(entry.registrySlug)
    try {
      await navigator.clipboard.writeText(command)
      toast.success('Install command copied')
    } catch {
      toast.error('Could not copy — select the command manually')
    }
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-sm font-semibold tracking-tight">Gradient Playground</p>
          <p className="text-muted-foreground text-xs">
            Free MIT components from{' '}
            <a
              href="https://gradients.sh"
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              gradients.sh
            </a>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RendererBadge kind={entry.kind} />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? 'Light mode' : 'Dark mode'}
          </Button>
          <Button size="sm" onClick={() => void copyInstall()}>
            Copy install command
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="hidden lg:inline-flex"
            onClick={() => setPanelOpen((open) => !open)}
          >
            {panelOpen ? 'Hide controls' : 'Show controls'}
          </Button>
        </div>
      </header>

      <div className="flex min-h-[calc(100dvh-57px)] flex-col lg:flex-row">
        <main className="min-w-0 flex-1">
          <HeroStage
            componentId={componentId}
            gradientProps={gradientProps}
            overlay={
              <>
                <RendererBadge kind={entry.kind} />
                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance drop-shadow-sm md:text-4xl">
                  {entry.label} background
                </h1>
                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed drop-shadow-sm">
                  {entry.description} Tweak speed, grain, and colours in the panel, then copy the
                  shadcn install command for this component.
                </p>
                <p className="rounded-md border border-border/50 bg-background/70 px-3 py-2 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
                  {installCommand(entry.registrySlug)}
                </p>
              </>
            }
          />
          <GallerySection gradientProps={gradientProps} />
        </main>

        <aside
          className="border-t border-border/60 bg-background lg:w-[min(100%,360px)] lg:border-t-0 lg:border-l"
          style={{
            display: panelOpen ? undefined : 'none',
          }}
        >
          <PlaygroundControls
            componentId={componentId}
            controls={controls}
            useThemeColors={useThemeColors}
            onComponentId={setComponentId}
            onControls={(patch) => setControls((prev) => ({ ...prev, ...patch }))}
            onUseThemeColors={setUseThemeColors}
          />
        </aside>
      </div>

      <Toaster richColors position="bottom-left" />
    </div>
  )
}

export default App
