import { describe, expect, test } from "bun:test"
import { movePart, partsInKit, placePart, removePart, rotatePart } from "./composer"
import type { CatalogAsset, ComposerPart } from "./types"

const asset: CatalogAsset = {
  id: "a",
  title: "A",
  type: "prop",
  kit: "k",
  triangles: 10,
  page: "",
  thumbnail: "",
  glb: "",
  module: "",
}

describe("composer", () => {
  test("place move rotate", () => {
    let parts: ComposerPart[] = []
    parts = placePart(parts, asset, 0, 0)
    const id = parts[0]!.id
    parts = movePart(parts, id, 2, 3)
    expect(parts[0]).toMatchObject({ x: 2, z: 3 })
    parts = rotatePart(parts, id, 45)
    expect(parts[0]?.rotationDeg).toBe(45)
  })

  test("removes a part, wraps rotation, and ignores an unknown id", () => {
    let parts: ComposerPart[] = placePart([], asset, 1, 2)
    const id = parts[0]!.id
    expect(movePart(parts, "missing", 9, 9)[0]).toMatchObject({ x: 1, z: 2 })
    parts = rotatePart(parts, id, 400)
    expect(parts[0]?.rotationDeg).toBe(40)
    parts = rotatePart(parts, id, -50)
    expect(parts[0]?.rotationDeg).toBe(-10)
    expect(removePart(parts, "missing")).toHaveLength(1)
    expect(removePart(parts, id)).toEqual([])
  })

  test("partsInKit keeps only assets from the active kit", () => {
    const other = { ...asset, id: "other" }
    const parts = placePart(placePart([], asset, 0, 0), other, 1, 1)
    expect(parts[0]!.id).not.toBe(parts[1]!.id)
    expect(partsInKit(parts, [asset]).map((p) => p.assetId)).toEqual(["a"])
    expect(partsInKit(parts, [])).toEqual([])
  })
})