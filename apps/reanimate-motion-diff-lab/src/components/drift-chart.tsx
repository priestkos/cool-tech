import type { MotionProperty, TimeValue } from "@/lib/types"

type DriftChartProps = {
  property: MotionProperty
  refTrack: TimeValue[]
  copyTrack: TimeValue[]
  width?: number
  height?: number
}

function pathFor(track: TimeValue[], width: number, height: number, min: number, max: number) {
  if (track.length === 0) return ""
  const span = max - min || 1
  const lastT = track[track.length - 1].timeMs || 1
  return track
    .map((point, i) => {
      const x = (point.timeMs / lastT) * width
      const y = height - ((point.value - min) / span) * height
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")
}

export function DriftChart({
  property,
  refTrack,
  copyTrack,
  width = 320,
  height = 96,
}: DriftChartProps) {
  const merged = [...refTrack, ...copyTrack].map((p) => p.value)
  const min = Math.min(...merged, 0)
  const max = Math.max(...merged, 1)
  const lastT = Math.max(refTrack.at(-1)?.timeMs ?? 1, copyTrack.at(-1)?.timeMs ?? 1)
  const diffPath = refTrack
    .map((point, i) => {
      const copyVal = copyTrack[i]?.value ?? point.value
      const diff = copyVal - point.value
      const x = (point.timeMs / lastT) * width
      const span = max - min || 1
      const y = height / 2 - (diff / span) * (height / 2)
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground">
        <span className="font-medium uppercase tracking-wide">{property}</span>
        <span>ref · copy · Δ</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-24 w-full rounded-md border border-border/60 bg-muted/20"
        role="img"
        aria-label={`${property} drift chart`}
      >
        <path
          d={pathFor(refTrack, width, height, min, max)}
          fill="none"
          stroke="var(--chart-2)"
          strokeWidth="1.5"
        />
        <path
          d={pathFor(copyTrack, width, height, min, max)}
          fill="none"
          stroke="var(--chart-4)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d={diffPath}
          fill="none"
          stroke="var(--destructive)"
          strokeWidth="1"
          opacity="0.85"
        />
      </svg>
    </div>
  )
}
