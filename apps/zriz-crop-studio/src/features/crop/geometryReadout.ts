import type { CropValue, CropperSnapshot } from "@zriz/core"

export type GeometryReadout = {
  rect: string
  rotation: string
  zoom: string
  aspect: string
  flips: string
}

export const formatAspect = (aspect: CropValue["aspect"]): string => {
  if (aspect === "free") return "free"
  if (aspect === "original") return "original"
  const ratio = aspect
  const tol = 0.02
  if (Math.abs(ratio - 1) < tol) return "1:1"
  if (Math.abs(ratio - 4 / 5) < tol) return "4:5"
  if (Math.abs(ratio - 5 / 4) < tol) return "5:4"
  if (Math.abs(ratio - 16 / 9) < tol) return "16:9"
  if (Math.abs(ratio - 9 / 16) < tol) return "9:16"
  return `${ratio.toFixed(3)}`
}

export const formatGeometryReadout = (
  value: CropValue,
  snapshot: CropperSnapshot,
  zoom: number,
): GeometryReadout => {
  const cx = (value.center.x * 100).toFixed(1)
  const cy = (value.center.y * 100).toFixed(1)
  const w = (value.size.width * 100).toFixed(1)
  const h = (value.size.height * 100).toFixed(1)
  const rotation =
    `${value.rotation >= 0 ? "+" : ""}${value.rotation.toFixed(1)}°`
  const flips = value.mirrored ? "horizontal" : "none"

  return {
    rect: `center (${cx}%, ${cy}%) · size ${w}% × ${h}%`,
    rotation,
    zoom: `${zoom.toFixed(2)}×`,
    aspect: formatAspect(snapshot.aspect),
    flips: flips.length > 0 ? flips : "none",
  }
}

export const formatReadoutLines = (readout: GeometryReadout): string[] => [
  readout.rect,
  `rotation ${readout.rotation}`,
  `zoom ${readout.zoom}`,
  `aspect ${readout.aspect}`,
  `flip ${readout.flips}`,
]