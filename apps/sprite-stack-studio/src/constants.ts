export const UPSTREAM_PIN = {
  repo: "https://github.com/danielwh2/sprite-stacking",
  commit: "6fecdfd0d6e5a0595f979550e05f4b1fcde550fe",
  committerUtc: "2026-11-21T01:28:57Z",
  launchPost: "https://x.com/dwhitedesign/status/2123928042711958000",
  license: "MIT",
  author: "Daniel White",
} as const

export const SLICER_SCRIPT = new URL(
  "../vendor/danielwh2-sprite-stacking/6fecdfd0d6e5a0595f979550e05f4b1fcde550fe/skills/sprite-stacking/scripts/views_to_slices.py",
  import.meta.url,
).pathname

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

export type SlicerOptions = {
  slices?: number | null
  round?: boolean
  colours?: number
  order?: "auto" | "reading"
  sideNose?: "left" | "right"
  shade?: number
  preview?: boolean
  normals?: boolean
  emissive?: boolean
}

export type SliceResponse = {
  title: string
  slices: number
  sliceWidth: number
  sliceHeight: number
  stripUrl: string
  viewerUrl: string
  sheetUrl?: string
}