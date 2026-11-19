import type { Size } from "@zriz/core"

export const clampExportSize = (
  width: number,
  height: number,
  max?: Size,
): { width: number; height: number } => {
  if (!max || width <= 0 || height <= 0) {
    return { width, height }
  }
  const scale = Math.min(max.width / width, max.height / height, 1)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}