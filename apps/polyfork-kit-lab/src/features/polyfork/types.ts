export type CatalogKit = {
  id: string
  title: string
  complete: boolean
  parts: number
  page: string
  index: string
  cover: string
}

export type CatalogAsset = {
  id: string
  title: string
  type: string
  kit: string
  triangles: number
  page: string
  thumbnail: string
  glb: string
  module: string
}

export type CatalogSnapshot = {
  site: string
  licence: string
  models: number
  kits: CatalogKit[]
  assets: CatalogAsset[]
}

export type KnobKind = "choice" | "range" | "toggle" | "color"

export type KnobDef = {
  key: string
  kind: KnobKind
  label: string
  default: string | number | boolean
  options?: string[]
  min?: number
  max?: number
  step?: number
}

export type KnobValues = Record<string, string | number | boolean>

export type PreviewMeshMode = "placeholder" | "glb" | "parametric"

export type NetworkMode = "offline" | "live"

export type ComposerPart = {
  id: string
  assetId: string
  title: string
  type: string
  x: number
  z: number
  rotationDeg: number
}

export type LoadTiming = {
  startedAt: number
  finishedAt: number
  ms: number
  label: string
}