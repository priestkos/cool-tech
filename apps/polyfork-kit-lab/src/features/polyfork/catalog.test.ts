import { describe, expect, test } from "bun:test"
import { assetTypes, filterAssets } from "./catalog"
import type { CatalogAsset } from "./types"

const sample: CatalogAsset[] = [
  {
    id: "a-frame-cabin-6cb550",
    title: "A-Frame Cabin",
    type: "building",
    kit: "campground-lake-ad32b0",
    triangles: 1502,
    page: "https://polyfork.dev/asset/a-frame-cabin-6cb550",
    thumbnail: "https://polyfork.dev/files/x.png",
    glb: "https://polyfork.dev/cdn/a-frame-cabin-6cb550.glb",
    module: "https://polyfork.dev/cdn/a-frame-cabin-6cb550.mjs",
  },
  {
    id: "fox-base",
    title: "Fox",
    type: "character",
    kit: "nature-forest-kit-f29d6a",
    triangles: 200,
    page: "https://polyfork.dev/asset/fox-base",
    thumbnail: "https://polyfork.dev/files/y.png",
    glb: "https://polyfork.dev/cdn/fox-base.glb",
    module: "https://polyfork.dev/cdn/fox-base.mjs",
  },
]

describe("filterAssets", () => {
  test("search by title", () => {
    const r = filterAssets(sample, "cabin", "all", "all")
    expect(r.map((a) => a.id)).toEqual(["a-frame-cabin-6cb550"])
  })

  test("kit filter", () => {
    const r = filterAssets(sample, "", "campground-lake-ad32b0", "all")
    expect(r).toHaveLength(1)
  })

  test("type filter", () => {
    const r = filterAssets(sample, "", "all", "character")
    expect(r[0]?.id).toBe("fox-base")
  })
})

describe("assetTypes", () => {
  test("unique sorted", () => {
    expect(assetTypes(sample)).toEqual(["building", "character"])
  })
})