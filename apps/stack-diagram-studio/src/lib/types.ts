export type TileCategory =
  | "user"
  | "client"
  | "hosting"
  | "api"
  | "database"
  | "auth"
  | "payments"
  | "storage"
  | "queue"
  | "observability"
  | "other"

export interface CatalogEntry {
  id: string
  label: string
  monogram: string
  category: TileCategory
  aliases: string[]
}

export interface DiagramTile {
  instanceId: string
  catalogId: string | null
  label: string
  monogram: string
  category: TileCategory
  isUnknown?: boolean
}

export type EdgeKind = "calls" | "hosts" | "uses"

export interface DiagramEdge {
  from: string
  to: string
  kind: EdgeKind
}

export interface ParseResult {
  tiles: DiagramTile[]
  edges: DiagramEdge[]
}

export type DiagramTheme = "light" | "dark"

export interface TilePosition {
  x: number
  y: number
}

export type PositionMap = Record<string, TilePosition>

export const TILE_WIDTH = 144
export const TILE_HEIGHT = 72
export const GRID = 8

export interface LayoutResult {
  positions: PositionMap
  width: number
  height: number
}
