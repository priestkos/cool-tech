import { facesForBox, pointsToPath, sortFaces } from "@/lib/isometric"
import type { PartPose } from "@/lib/types"
import { useMemo } from "react"

const ORIGIN = { x: 2, y: 1, z: 0 }
const SCALE = 36

type Props = {
  poses: PartPose[]
  highlightedId: string | null
  onHover: (id: string | null) => void
  onFocusPart: (id: string | null) => void
  callout?: { id: string; label: string; description: string; x: number; y: number } | null
}

export function IsometricDiagram({
  poses,
  highlightedId,
  onHover,
  onFocusPart,
  callout,
}: Props) {
  const faces = useMemo(() => {
    const all = poses.flatMap((pose) =>
      facesForBox(
        pose.partId,
        pose.position,
        pose.size,
        pose.rotationZ,
        pose.fill,
        pose.stroke,
        ORIGIN,
        SCALE,
      ),
    )
    return sortFaces(all)
  }, [poses])

  const dimmed = highlightedId !== null

  return (
    <div className="relative w-full">
      <svg
        viewBox="-80 -40 520 360"
        className="h-auto w-full max-h-[420px] text-foreground"
        role="img"
        aria-label="Isometric machine diagram"
      >
        <rect x="-80" y="-40" width="520" height="360" className="fill-muted/30" />
        {faces.map((face, i) => {
          const dim = dimmed && face.partId !== highlightedId
          return (
            <path
              key={`${face.partId}-${i}`}
              d={pointsToPath(face.points)}
              fill={face.fill}
              stroke={face.stroke}
              strokeWidth={1}
              opacity={dim ? 0.25 : 1}
              className="transition-opacity duration-150"
              onPointerEnter={() => onHover(face.partId)}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onFocusPart(face.partId)}
              onBlur={() => onFocusPart(null)}
              tabIndex={0}
              role="button"
              aria-label={face.partId}
            />
          )
        })}
        {callout ? (
          <g pointerEvents="none">
            <line
              x1={callout.x}
              y1={callout.y}
              x2={callout.x + 40}
              y2={callout.y - 30}
              stroke="currentColor"
              strokeWidth={1}
            />
            <rect
              x={callout.x + 42}
              y={callout.y - 52}
              width={170}
              height={52}
              rx={6}
              className="fill-popover stroke-border"
            />
            <text x={callout.x + 50} y={callout.y - 34} className="fill-popover-foreground text-[11px] font-semibold">
              {callout.label}
            </text>
            <text x={callout.x + 50} y={callout.y - 16} className="fill-muted-foreground text-[10px]">
              {callout.description.slice(0, 48)}
              {callout.description.length > 48 ? "…" : ""}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  )
}

export function partScreenAnchor(pose: PartPose): { x: number; y: number } {
  const cx = pose.position.x + pose.size.x / 2
  const cy = pose.position.y + pose.size.y / 2
  const cz = pose.position.z + pose.size.z
  const ISO_COS = Math.cos(Math.PI / 6)
  const ISO_SIN = Math.sin(Math.PI / 6)
  const x = cx - ORIGIN.x
  const y = cy - ORIGIN.y
  const z = cz - ORIGIN.z
  return {
    x: (x - y) * ISO_COS * SCALE,
    y: ((x + y) * ISO_SIN - z) * SCALE,
  }
}
