import { useEffect, useRef } from "react"
import type { MarbleViewerProps } from "@/lib/talking-marble-lab"
import { syncPropsToWebComponent } from "@/lib/talking-marble-lab"

type WcElement = HTMLElement & Parameters<typeof syncPropsToWebComponent>[0]

export function WebComponentMarble(props: MarbleViewerProps) {
  const ref = useRef<WcElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    syncPropsToWebComponent(el, props)
  }, [props])

  return (
    <talking-marble
      ref={ref as never}
      aria-label={props.decorative ? undefined : props.ariaLabel}
      style={{ width: props.size, height: props.size, marginInline: "auto" }}
    />
  )
}