import { mount, type Mounted } from "pele"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { peleThemeToStyle, type PeleTheme } from "@/lib/peleTheme"

type PelePanelProps = {
  source: string
  theme: PeleTheme
  panelWidthPercent: number
  onRendered: (ms: number) => void
}

export function PelePanel({
  source,
  theme,
  panelWidthPercent,
  onRendered,
}: PelePanelProps) {
  const diagramRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef<Mounted | null>(null)
  const renderStartRef = useRef(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const diagramEl = diagramRef.current
    if (!diagramEl) return

    renderStartRef.current = performance.now()
    const bag: { mounted?: Mounted } = {}
    const instance = mount(diagramEl, source, {
      zoom: false,
      onRender: () => {
        onRendered(performance.now() - renderStartRef.current)
        setError(bag.mounted?.error ? String(bag.mounted.error) : null)
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : String(err))
      },
    })
    bag.mounted = instance
    mountedRef.current = instance

    return () => {
      instance.destroy()
      mountedRef.current = null
    }
  }, [onRendered])

  useEffect(() => {
    const instance = mountedRef.current
    if (!instance) return
    renderStartRef.current = performance.now()
    instance.update(source)
    if (instance.error) {
      setError(String(instance.error))
    }
  }, [source])

  useEffect(() => {
    mountedRef.current?.refresh()
  }, [panelWidthPercent, theme])

  return (
    <div
      className="flex min-h-72 flex-col gap-2 transition-[width] duration-200"
      style={{ width: `${panelWidthPercent}%` }}
    >
      <div
        className={cn(
          "pele relative min-h-64 flex-1 overflow-auto rounded-lg border bg-[var(--pele-bg)] p-3",
        )}
        style={peleThemeToStyle(theme)}
      >
        <div ref={diagramRef} className="min-h-48 w-full" />
        {error ? (
          <p className="mt-2 text-sm text-[var(--pele-error,#b91c1c)]">{error}</p>
        ) : null}
      </div>
    </div>
  )
}
