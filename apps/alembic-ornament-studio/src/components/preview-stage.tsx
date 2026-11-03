import { useCallback, useRef } from 'react'
import { Framed, Ornament } from '@lauriparonen/alembic-ornaments/react'
import type { StudioState } from '@/lib/studio-state'

interface PreviewStageProps {
  state: StudioState
  onResize: (width: number, height: number) => void
}

export function PreviewStage({ state, onResize }: PreviewStageProps) {
  const dragging = useRef(false)
  const start = useRef({ x: 0, y: 0, w: 0, h: 0 })

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true
      start.current = { x: e.clientX, y: e.clientY, w: state.cardWidth, h: state.cardHeight }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [state.cardWidth, state.cardHeight],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - start.current.x
      const dy = e.clientY - start.current.y
      onResize(start.current.w + dx, start.current.h + dy)
    },
    [onResize],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  return (
    <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-6">
      <div className="relative" style={{ width: state.cardWidth, height: state.cardHeight }}>
        <Framed
          preset={state.framePreset}
          seed={state.frameSeed}
          size={state.frameSize}
          clear={state.frameClear}
          color={state.inkColor}
          className="h-full w-full rounded-sm bg-background shadow-sm"
          style={{ color: state.inkColor }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center" style={{ color: state.inkColor }}>
            {state.dividerEnabled ? (
              <Ornament
                preset={state.dividerPreset}
                seed={state.dividerSeed}
                color={state.inkColor}
                className="w-[min(100%,18rem)]"
              />
            ) : null}
            {state.layout === 'card' ? (
              <>
                <h2 className="font-serif text-xl font-semibold leading-tight">{state.title}</h2>
                <p className="max-w-prose font-serif text-sm leading-relaxed text-muted-foreground" style={{ color: 'color-mix(in oklch, currentColor 72%, transparent)' }}>
                  {state.body}
                </p>
              </>
            ) : (
              <>
                <blockquote className="max-w-prose font-serif text-base italic leading-relaxed">“{state.body}”</blockquote>
                {state.title ? <p className="font-serif text-sm">— {state.title}</p> : null}
              </>
            )}
          </div>
        </Framed>
        <button
          type="button"
          aria-label="Resize preview"
          className="absolute -bottom-2 -right-2 flex size-6 cursor-se-resize items-center justify-center rounded-full border border-border bg-background text-[0.55rem] shadow-sm"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          ↘
        </button>
      </div>
    </div>
  )
}
