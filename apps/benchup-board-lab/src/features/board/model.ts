export const SNAP_TOLERANCE = 0.25
export const DEFAULT_THICKNESS = 0.75
export const AUTOSAVE_KEY = "benchup-board-lab:v1"

export type ToolMode = "place" | "pushpull" | "move"

export type Board = {
  id: string
  originX: number
  originZ: number
  /** Nominal length along X (inches). */
  length: number
  /** Nominal width along Z (inches). */
  width: number
  thickness: number
}

export type LabSnapshot = {
  version: 1
  boards: Board[]
}

const FRACTION = /^(\d+)\s+(\d+)\/(\d+)$/

export function parseDimension(input: string): number | null {
  const raw = input.trim().toLowerCase().replace(/″/g, '"').replace(/′/g, "'")
  if (!raw) return null

  let candidate = raw
  const feetMatch = candidate.match(/^([\d.]+)\s*(?:ft|feet|')$/)
  if (feetMatch) {
  const feet = Number(feetMatch[1])
    return Number.isFinite(feet) && feet > 0 ? feet * 12 : null
  }

  const fracMatch = candidate.match(FRACTION)
  if (fracMatch) {
    const whole = Number(fracMatch[1])
    const num = Number(fracMatch[2])
    const den = Number(fracMatch[3])
    if (den === 0) return null
    candidate = String(whole + num / den)
  }

  const stripped = candidate.replace(/\s*(?:in|inch|inches|"|\u2033)$/i, "")
  const value = Number.parseFloat(stripped)
  if (!Number.isFinite(value) || value <= 0) return null
  return Math.round(value * 1000) / 1000
}

export function boardFeet(
  thickness: number,
  width: number,
  length: number
): number {
  const bf = (thickness * width * length) / 144
  return Math.round(bf * 1000) / 1000
}

export function totalBoardFeet(boards: Board[]): number {
  const sum = boards.reduce(
    (acc, b) => acc + boardFeet(b.thickness, b.width, b.length),
    0
  )
  return Math.round(sum * 1000) / 1000
}

type Aabb = { minX: number; maxX: number; minZ: number; maxZ: number }

function boardAabb(board: Pick<Board, "originX" | "originZ" | "length" | "width">): Aabb {
  return {
    minX: board.originX,
    maxX: board.originX + board.length,
    minZ: board.originZ,
    maxZ: board.originZ + board.width,
  }
}

type SnapCandidate = { x: number; z: number; score: number }

function pushSnap(
  snaps: SnapCandidate[],
  x: number,
  z: number,
  score: number
): void {
  snaps.push({ x, z, score })
}

export function snapPlacement(
  boards: Board[],
  selfId: string | null,
  length: number,
  width: number,
  x: number,
  z: number
): { x: number; z: number } {
  const snaps: SnapCandidate[] = []
  const roundedX = Math.round(x)
  const roundedZ = Math.round(z)
  pushSnap(snaps, roundedX, roundedZ, Math.abs(x - roundedX) + Math.abs(z - roundedZ))

  const self: Aabb = {
    minX: x,
    maxX: x + length,
    minZ: z,
    maxZ: z + width,
  }

  for (const other of boards) {
    if (other.id === selfId) continue
    const o = boardAabb(other)

    const alignRightToLeft = o.minX - length
    if (Math.abs(self.maxX - o.minX) <= SNAP_TOLERANCE || Math.abs(x + length - o.minX) <= SNAP_TOLERANCE) {
      const snapX = alignRightToLeft
      const snapZ = Math.abs(z - other.originZ) <= SNAP_TOLERANCE ? other.originZ : roundedZ
      pushSnap(snaps, snapX, snapZ, Math.abs(snapX - x) + Math.abs(snapZ - z))
    }

    const alignLeftToRight = o.maxX
    if (Math.abs(x - o.maxX) <= SNAP_TOLERANCE) {
      const snapZ = Math.abs(z - other.originZ) <= SNAP_TOLERANCE ? other.originZ : roundedZ
      pushSnap(snaps, alignLeftToRight, snapZ, Math.abs(alignLeftToRight - x) + Math.abs(snapZ - z))
    }

    const alignFrontToBack = o.maxZ
    if (Math.abs(z - o.maxZ) <= SNAP_TOLERANCE) {
      const snapX = Math.abs(x - other.originX) <= SNAP_TOLERANCE ? other.originX : roundedX
      pushSnap(snaps, snapX, alignFrontToBack, Math.abs(snapX - x) + Math.abs(alignFrontToBack - z))
    }

    const alignBackToFront = o.minZ - width
    if (Math.abs(z + width - o.minZ) <= SNAP_TOLERANCE) {
      const snapX = Math.abs(x - other.originX) <= SNAP_TOLERANCE ? other.originX : roundedX
      pushSnap(snaps, snapX, alignBackToFront, Math.abs(snapX - x) + Math.abs(alignBackToFront - z))
    }
  }

  snaps.sort((a, b) => a.score - b.score)
  const best = snaps[0]
  return { x: best?.x ?? roundedX, z: best?.z ?? roundedZ }
}

export function createBoard(
  length: number,
  width: number,
  originX: number,
  originZ: number,
  thickness = DEFAULT_THICKNESS
): Board {
  return {
    id: crypto.randomUUID(),
    originX,
    originZ,
    length,
    width,
    thickness,
  }
}

export function applyPushPull(board: Board, thickness: number): Board {
  const t = Math.max(0.25, Math.min(4, Math.round(thickness * 1000) / 1000))
  return { ...board, thickness: t }
}

export function serializeLab(boards: Board[]): string {
  const snapshot: LabSnapshot = { version: 1, boards }
  return JSON.stringify(snapshot, null, 2)
}

export function parseLabJson(raw: string): Board[] {
  const data = JSON.parse(raw) as LabSnapshot
  if (data.version !== 1 || !Array.isArray(data.boards)) {
    throw new Error("Invalid lab JSON")
  }
  return data.boards.map((b) => ({
    ...b,
    thickness: b.thickness ?? DEFAULT_THICKNESS,
  }))
}
