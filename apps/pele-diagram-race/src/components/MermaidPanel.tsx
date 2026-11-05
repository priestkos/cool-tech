import DOMPurify from "dompurify"
import mermaid from "mermaid"
import { useEffect, useId, useRef, useState } from "react"
import { MERMAID_CONFIG } from "@/lib/mermaidConfig"

let mermaidReady = false
let renderSequence = 0

function ensureMermaid() {
  if (mermaidReady) return
  mermaid.initialize(MERMAID_CONFIG)
  mermaidReady = true
}

type MermaidPanelProps = {
  source: string
  onRendered: (ms: number) => void
}

export function MermaidPanel({ source, onRendered }: MermaidPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const renderId = useId().replace(/:/g, "")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ensureMermaid()
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    const id = `mmd-${renderId}-${++renderSequence}`
    const run = async () => {
      setError(null)
      const started = performance.now()
      try {
        const { svg } = await mermaid.render(id, source)
        if (cancelled) return
        const sanitized = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
          FORBID_TAGS: ["style"],
          FORBID_ATTR: ["style"],
          RETURN_DOM_FRAGMENT: true,
        })
        container.replaceChildren(sanitized)
        onRendered(performance.now() - started)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        container.textContent = ""
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [source, onRendered, renderId])

  return (
    <div className="flex min-h-72 flex-col gap-2">
      <div
        className="relative min-h-64 flex-1 overflow-auto rounded-lg border bg-card p-3"
      >
        <div ref={containerRef} className="mermaid min-h-48 w-full [&_svg]:max-w-full" />
        {error ? (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        ) : null}
      </div>
    </div>
  )
}
