import { describe, expect, test } from "bun:test"
import { facesForBox, projectIso, rotateZ } from "./isometric"

describe("isometric projection", () => {
  test("origin maps to canvas origin offset", () => {
    const o = { x: 0, y: 0, z: 0 }
    expect(projectIso({ x: 0, y: 0, z: 0 }, o, 1)).toEqual({ x: 0, y: 0 })
  })

  test("raising z moves screen y upward", () => {
    const o = { x: 0, y: 0, z: 0 }
    const low = projectIso({ x: 0, y: 0, z: 0 }, o, 1)
    const high = projectIso({ x: 0, y: 0, z: 2 }, o, 1)
    expect(high.y).toBeLessThan(low.y)
  })

  test("rotateZ preserves pivot", () => {
    const pivot = { x: 2, y: 2, z: 0 }
    const rotated = rotateZ(pivot, Math.PI / 2, pivot)
    expect(rotated.x).toBeCloseTo(2, 5)
    expect(rotated.y).toBeCloseTo(2, 5)
  })

  test("facesForBox returns three visible faces", () => {
    const faces = facesForBox(
      "test",
      { x: 0, y: 0, z: 0 },
      { x: 2, y: 2, z: 1 },
      0,
      "#ccc",
      "#111",
      { x: 0, y: 0, z: 0 },
      10,
    )
    expect(faces).toHaveLength(3)
    expect(faces.every((f) => f.points.length === 4)).toBe(true)
  })
})
