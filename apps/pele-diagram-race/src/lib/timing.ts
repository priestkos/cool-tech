export function averageMs(samples: number[]): number {
  if (samples.length === 0) return 0
  const sum = samples.reduce((acc, value) => acc + value, 0)
  return sum / samples.length
}

export function formatMs(value: number): string {
  if (!Number.isFinite(value)) return "—"
  if (value < 1) return value.toFixed(2)
  if (value < 10) return value.toFixed(1)
  return Math.round(value).toString()
}

export function speedupRatio(
  baselineMs: number,
  fasterMs: number,
): number | null {
  if (baselineMs <= 0 || fasterMs <= 0) return null
  return baselineMs / fasterMs
}
