import { useCropperState, useCropperValue, type Cropper } from "@zriz/react"
import { useMemo } from "react"
import { formatGeometryReadout, formatReadoutLines } from "./geometryReadout"

type Props = {
  cropper: Cropper
}

export function LiveGeometryReadout({ cropper }: Props) {
  const snapshot = useCropperState((s) => s, cropper)
  const value = useCropperValue(cropper)
  const zoom = useCropperState(() => cropper.getZoom(), cropper)

  const lines = useMemo(
    () => formatReadoutLines(formatGeometryReadout(value, snapshot, zoom)),
    [value, snapshot, zoom],
  )

  return (
    <dl className="space-y-2 text-sm">
      {lines.map((line) => (
        <div key={line} className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">
            {line.split(" ")[0]}
          </dt>
          <dd className="font-mono text-xs leading-relaxed">{line}</dd>
        </div>
      ))}
    </dl>
  )
}