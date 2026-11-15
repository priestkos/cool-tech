import type { CatalogAsset, ComposerPart } from "./types"

let seq = 0

export function nextComposerId(): string {
  seq += 1
  return `part-${seq}`
}

export function placePart(
  parts: ComposerPart[],
  asset: CatalogAsset,
  x: number,
  z: number
): ComposerPart[] {
  return [
    ...parts,
    {
      id: nextComposerId(),
      assetId: asset.id,
      title: asset.title,
      type: asset.type,
      x,
      z,
      rotationDeg: 0,
    },
  ]
}

export function movePart(
  parts: ComposerPart[],
  id: string,
  x: number,
  z: number
): ComposerPart[] {
  return parts.map((p) => (p.id === id ? { ...p, x, z } : p))
}

export function rotatePart(
  parts: ComposerPart[],
  id: string,
  deltaDeg: number
): ComposerPart[] {
  return parts.map((p) =>
    p.id === id ? { ...p, rotationDeg: (p.rotationDeg + deltaDeg) % 360 } : p
  )
}

export function removePart(parts: ComposerPart[], id: string): ComposerPart[] {
  return parts.filter((p) => p.id !== id)
}

export function partsInKit(parts: ComposerPart[], kitAssets: CatalogAsset[]) {
  const ids = new Set(kitAssets.map((a) => a.id))
  return parts.filter((p) => ids.has(p.assetId))
}