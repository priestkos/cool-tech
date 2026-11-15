import { describe, expect, test } from "bun:test"
import { movePart, placePart, rotatePart } from "./composer"
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
})