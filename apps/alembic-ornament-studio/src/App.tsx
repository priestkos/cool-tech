import { useCallback, useEffect, useMemo, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { ControlsPanel } from '@/components/controls-panel'
import { PresetStrip } from '@/components/preset-strip'
import { PreviewStage } from '@/components/preview-stage'
import { StudioHeader } from '@/components/studio-header'
import { composeExportSvg } from '@/lib/export-svg'
import { exportPngFromState } from '@/lib/export-png'
import { exportSvgFileName, triggerDownload } from '@/lib/download'
import {
  DEFAULT_STUDIO_STATE,
  readStudioStateFromLocation,
  type StudioState,
  writeStudioStateToLocation,
} from '@/lib/studio-state'

function useTheme() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}

export default function App() {
  const { dark, toggle } = useTheme()
  const [state, setState] = useState<StudioState>(() => readStudioStateFromLocation())

  const mergeState = useCallback((patch: Partial<StudioState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      writeStudioStateToLocation(next)
      return next
    })
  }, [])

  const clampSize = useCallback((w: number, h: number) => {
    mergeState({
      cardWidth: Math.min(900, Math.max(240, Math.round(w))),
      cardHeight: Math.min(700, Math.max(180, Math.round(h))),
    })
  }, [mergeState])

  const pageBg = useMemo(
    () => (dark ? '#262626' : '#ffffff'),
    [dark],
  )

  const onExportSvg = useCallback(() => {
    const svg = composeExportSvg({
      state,
      width: state.cardWidth,
      height: state.cardHeight,
      includeBackground: true,
      pageBackground: pageBg,
    })
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    triggerDownload(blob, exportSvgFileName(state.framePreset, state.frameSeed))
    toast.success('SVG downloaded')
  }, [state, pageBg])

  const onExportPng = useCallback(
    async (transparent: boolean) => {
      try {
        await exportPngFromState(state, {
          transparentBackground: transparent,
          pageBackground: pageBg,
        })
        toast.success('PNG downloaded')
      } catch {
        toast.error('PNG export failed')
      }
    },
    [state, pageBg],
  )

  useEffect(() => {
    if (!window.location.search) {
      writeStudioStateToLocation(DEFAULT_STUDIO_STATE)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StudioHeader dark={dark} onToggleTheme={toggle} />
      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <PreviewStage state={state} onResize={clampSize} />
          <PresetStrip
            state={state}
            onSelectFrame={(framePreset) => mergeState({ framePreset })}
            onSelectDivider={(dividerPreset) => mergeState({ dividerPreset, dividerEnabled: true })}
          />
        </div>
        <ControlsPanel state={state} onChange={mergeState} onExportSvg={onExportSvg} onExportPng={onExportPng} />
      </main>
      <Toaster />
    </div>
  )
}
