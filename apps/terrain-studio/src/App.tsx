import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TopographicBackground } from 'topographic-react'
import type { TopographicBackground as TopographicInstance } from 'topographic'
import { ControlPanel } from '@/components/ControlPanel'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import {
  loadStudioState,
  saveStudioState,
  studioToTopographicInput,
  type StudioState,
} from '@/lib/studio-settings'

const PANEL_WIDTH = 360

function App() {
  const [state, setState] = useState<StudioState>(() => loadStudioState())
  const instanceRef = useRef<TopographicInstance | null>(null)
  const [exporting, setExporting] = useState(false)

  const topoInput = useMemo(() => studioToTopographicInput(state), [state])

  useEffect(() => {
    saveStudioState(state)
  }, [state])

  const applyInsets = useCallback(() => {
    const instance = instanceRef.current
    if (!instance) return
    if (state.panelOpen) {
      instance.setInsets({ right: PANEL_WIDTH })
    } else {
      instance.setInsets(null)
    }
  }, [state.panelOpen])

  const onReady = useCallback(
    (instance: TopographicInstance | null) => {
      instanceRef.current = instance
      if (instance?.status === 'fallback') {
        toast.error('WebGL is not available; showing paper colour only.')
      }
      applyInsets()
    },
    [applyInsets],
  )

  useEffect(() => {
    applyInsets()
  }, [applyInsets])

  const patchState = (patch: Partial<StudioState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }

  const exportPng = async () => {
    const instance = instanceRef.current
    if (!instance) {
      toast.error('Terrain is still loading.')
      return
    }
    if (instance.status === 'fallback') {
      toast.error('Cannot export without WebGL.')
      return
    }
    setExporting(true)
    try {
      const blob = await instance.snapshot({ width: 1920, height: 1080 })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `terrain-studio-${state.styleName}-${state.mode}.png`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('PNG exported')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background text-foreground">
      <TopographicBackground
        className="absolute inset-0 h-full w-full"
        onReady={onReady}
        styleName={state.styleName}
        {...topoInput}
      />

      <header
        className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3"
      >
        <div className="pointer-events-auto rounded-lg border border-border/60 bg-background/80 px-3 py-2 shadow-sm backdrop-blur-md">
          <p className="text-sm font-semibold tracking-tight">Terrain Studio</p>
          <p className="text-muted-foreground text-xs">
            topographic · {state.styleName} · seed {state.seed}
          </p>
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          <div className="flex rounded-lg border border-border/60 bg-background/80 p-0.5 shadow-sm backdrop-blur-md">
            <Button
              size="sm"
              variant={state.mode === '2d' ? 'default' : 'ghost'}
              onClick={() => patchState({ mode: '2d' })}
            >
              2D contours
            </Button>
            <Button
              size="sm"
              variant={state.mode === '3d' ? 'default' : 'ghost'}
              onClick={() => patchState({ mode: '3d' })}
            >
              3D terrain
            </Button>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="border border-border/60 bg-background/80 backdrop-blur-md"
            disabled={exporting}
            onClick={() => void exportPng()}
          >
            {exporting ? 'Exporting…' : 'Export PNG'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-border/60 bg-background/80 backdrop-blur-md"
            onClick={() => patchState({ panelOpen: !state.panelOpen })}
          >
            {state.panelOpen ? 'Hide panel' : 'Show panel'}
          </Button>
        </div>
      </header>

      <aside
        className="absolute inset-y-0 right-0 z-10 border-l border-border/70 bg-background/92 shadow-xl backdrop-blur-md transition-[width,opacity] duration-200"
        style={{
          width: state.panelOpen ? PANEL_WIDTH : 0,
          opacity: state.panelOpen ? 1 : 0,
          pointerEvents: state.panelOpen ? 'auto' : 'none',
        }}
        aria-hidden={!state.panelOpen}
      >
        <ControlPanel state={state} onChange={patchState} />
      </aside>

      <Toaster richColors position="bottom-left" />
    </div>
  )
}

export default App
