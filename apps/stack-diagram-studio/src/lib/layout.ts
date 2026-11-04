import { layerOf } from "./edges"
import type { DiagramTile, LayoutResult, PositionMap } from "./types"
import { GRID, TILE_HEIGHT as TH, TILE_WIDTH as TW } from "./types"

const COLUMN_X = [48, 220, 392, 564, 736] as const
const ROW_GAP = 24
const TOP = 48

export function snapToGrid(value: number): number {
  return Math.round(value / GRID) * GRID
}

function columnForCategory(category: DiagramTile["category"]): number {
  const layer = layerOf(category)
  return Math.min(layer, COLUMN_X.length - 1)
}

/** Deterministic layered layout; same tiles -> same positions. */
export function computeAutoLayout(tiles: DiagramTile[]): LayoutResult {
  const positions: PositionMap = {}
  if (tiles.length === 0) {
    return { positions, width: 920, height: 320 }
  }

  const sorted = [...tiles].sort((a, b) => {
    const col = columnForCategory(a.category) - columnForCategory(b.category)
    if (col !== 0) return col
    const label = a.label.localeCompare(b.label)
    if (label !== 0) return label
    return a.instanceId.localeCompare(b.instanceId)
  })

  const rowCount: Record<number, number> = {}

  for (const tile of sorted) {
    const col = columnForCategory(tile.category)
    const row = rowCount[col] ?? 0
    rowCount[col] = row + 1
    const x = snapToGrid(COLUMN_X[col] ?? COLUMN_X[COLUMN_X.length - 1]!)
    const y = snapToGrid(TOP + row * (TH + ROW_GAP))
    positions[tile.instanceId] = { x, y }
  }

  const maxRow = Math.max(0, ...Object.values(rowCount))
  const height = snapToGrid(TOP + maxRow * (TH + ROW_GAP) + TH + 48)
  const width = 920

  return { positions, width, height }
}

export function mergePositions(
  auto: PositionMap,
  manual: PositionMap | undefined,
): PositionMap {
  if (!manual || Object.keys(manual).length === 0) return auto
  const merged: PositionMap = { ...auto }
  for (const [id, pos] of Object.entries(manual)) {
    if (merged[id]) {
      merged[id] = { x: snapToGrid(pos.x), y: snapToGrid(pos.y) }
    }
  }
  return merged
}

export function tilesOverlap(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  const pad = 4
  return !(
    a.x + TW + pad <= b.x ||
    b.x + TW + pad <= a.x ||
    a.y + TH + pad <= b.y ||
    b.y + TH + pad <= a.y
  )
}

export function layoutHasOverlaps(tiles: DiagramTile[], positions: PositionMap): boolean {
  const ids = tiles.map((t) => t.instanceId)
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const pa = positions[ids[i]!]
      const pb = positions[ids[j]!]
      if (pa && pb && tilesOverlap(pa, pb)) return true
    }
  }
  return false
}

// re-export dimensions for tests
export { TW as TILE_WIDTH, TH as TILE_HEIGHT }
