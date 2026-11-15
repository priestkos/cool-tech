import { describe, expect, test } from "bun:test"
import { polyforkCliCommand, snippetBlock } from "./snippet"
import type { CatalogAsset } from "./types"

const asset: CatalogAsset = {
  id: "a-frame-cabin-6cb550",
  title: "A-Frame Cabin",
  type: "building",
  kit: "k",
  triangles: 1,
  page: "https://polyfork.dev/asset/a-frame-cabin-6cb550",
  thumbnail: "",
  glb: "https://polyfork.dev/cdn/a-frame-cabin-6cb550.glb",
  module: "https://polyfork.dev/cdn/a-frame-cabin-6cb550.mjs",
}

describe("snippet", () => {
  test("import and cli", () => {
    expect(polyforkCliCommand(asset)).toBe(
      "npx polyfork@0.1.1 add a-frame-cabin-6cb550"
    )
    expect(snippetBlock(asset)).toContain("createAsset")
    expect(snippetBlock(asset)).toContain("polyfork.dev/cdn")
  })
})