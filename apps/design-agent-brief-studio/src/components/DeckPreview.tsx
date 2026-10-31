import { useEffect, useRef, useState } from 'react'
import type { DeckFormat } from '@/lib/formats'

type DeckPreviewProps = {
  html: string
  format: DeckFormat
  slideIndex: number
  onSlideIndexChange: (index: number) => void
  slideCount: number
}

export function DeckPreview({
  html,
  format,
  slideIndex,
  onSlideIndexChange,
  slideCount,
}: DeckPreviewProps) {
  const [frameKey, setFrameKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setFrameKey((k) => k + 1)
  }, [html])

  useEffect(() => {
    const parent = containerRef.current
    const iframe = iframeRef.current
    if (!parent || !iframe) return
    const scale = Math.min(parent.clientWidth / format.width, parent.clientHeight / format.height)
    iframe.style.transform = `scale(${scale})`
  }, [format, frameKey])

  const aspect = format.width / format.height

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border bg-muted/30"
        style={{ aspectRatio: String(aspect), maxHeight: 'min(52vh, 520px)' }}
      >
        <iframe
          key={frameKey}
          ref={iframeRef}
          title="Deck preview"
          sandbox="allow-scripts"
          srcDoc={html}
          className="absolute left-0 top-0 border-0"
          style={{
            width: format.width,
            height: format.height,
            transformOrigin: 'top left',
          }}
        />
        <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/80 px-2 py-1 font-mono text-[10px] text-white">
          Mock mode · sandbox preview
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => onSlideIndexChange(Math.max(0, slideIndex - 1))}
          >
            Previous
          </button>
          <span className="font-mono text-sm text-muted-foreground">
            {slideIndex + 1} / {slideCount}
          </span>
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => onSlideIndexChange(Math.min(slideCount - 1, slideIndex + 1))}
          >
            Next
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {Array.from({ length: slideCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSlideIndexChange(i)}
              className={`h-8 min-w-8 rounded border text-xs ${i === slideIndex ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
