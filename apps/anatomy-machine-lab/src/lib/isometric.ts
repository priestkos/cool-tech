import type { Vec3 } from "./types"

const ISO_COS = Math.cos(Math.PI / 6)
const ISO_SIN = Math.sin(Math.PI / 6)

/** Isometric screen projection (x right, y into page, z up). */
export function projectIso(
  point: Vec3,
  origin: Vec3,
  scale: number,
): { x: number; y: number } {
  const x = point.x - origin.x
  const y = point.y - origin.y
  const z = point.z - origin.z
  return {
    x: (x - y) * ISO_COS * scale,
    y: ((x + y) * ISO_SIN - z) * scale,
  }
}

export function rotateZ(point: Vec3, angle: number, pivot: Vec3): Vec3 {
  const dx = point.x - pivot.x
  const dy = point.y - pivot.y
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return {
    x: pivot.x + dx * c - dy * s,
    y: pivot.y + dx * s + dy * c,
    z: point.z,
  }
}

/** Axis-aligned box corners in local space (origin at min corner). */
export function boxCorners(size: Vec3): Vec3[] {
  const { x: w, y: d, z: h } = size
  return [
    { x: 0, y: 0, z: 0 },
    { x: w, y: 0, z: 0 },
    { x: w, y: d, z: 0 },
    { x: 0, y: d, z: 0 },
    { x: 0, y: 0, z: h },
    { x: w, y: 0, z: h },
    { x: w, y: d, z: h },
    { x: 0, y: d, z: h },
  ]
}

export type IsoFace = {
  points: { x: number; y: number }[]
  depth: number
  fill: string
  stroke: string
  partId: string
}

const TOP = [4, 5, 6, 7]
const LEFT = [0, 3, 7, 4]
const RIGHT = [1, 2, 6, 5]

export function facesForBox(
  partId: string,
  position: Vec3,
  size: Vec3,
  rotationZ: number,
  fill: string,
  stroke: string,
  origin: Vec3,
  scale: number,
): IsoFace[] {
  const pivot = {
    x: position.x + size.x / 2,
    y: position.y + size.y / 2,
    z: position.z,
  }
  const corners = boxCorners(size).map((c) => {
    const world = {
      x: position.x + c.x,
      y: position.y + c.y,
      z: position.z + c.z,
    }
    return rotationZ ? rotateZ(world, rotationZ, pivot) : world
  })

  const faceDefs = [
    { idx: TOP, normal: { x: 0, y: 0, z: 1 } },
    { idx: LEFT, normal: { x: -1, y: 0, z: 0 } },
    { idx: RIGHT, normal: { x: 0, y: 1, z: 0 } },
  ]

  return faceDefs.map(({ idx, normal }) => {
    const points = idx.map((i) => projectIso(corners[i], origin, scale))
    const center = {
      x: position.x + size.x / 2,
      y: position.y + size.y / 2,
      z: position.z + size.z / 2,
    }
    const depth =
      (center.x + center.y) * ISO_SIN - center.z + normal.x + normal.y
    return { points, depth, fill, stroke, partId }
  })
}

export function sortFaces(faces: IsoFace[]): IsoFace[] {
  return [...faces].sort((a, b) => a.depth - b.depth)
}

export function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ""
  const [first, ...rest] = points
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(" ")} Z`
}
