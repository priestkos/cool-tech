import { describe, expect, test } from "bun:test"
import { meshModesForNetwork } from "./modes"
import { assertLiveFetchAllowed } from "./network"
import { mockCreateAsset } from "./mock-parametric"
import type { CatalogAsset } from "./types"

describe("mode switching", () => {
  test("offline mesh modes", () => {
    expect(meshModesForNetwork("offline")).toEqual(["placeholder", "parametric"])
  })
  test("live mesh modes", () => {
    expect(meshModesForNetwork("live")).toContain("glb")
  })
  test("offline blocks external fetch", () => {
    expect(() => assertLiveFetchAllowed("offline", "https://polyfork.dev/x")).toThrow()
  })
  test("mock parametric build", () => {
    const asset: CatalogAsset = {
      id: "x",
      title: "X",
      type: "building",
      kit: "k",
      triangles: 100,
      page: "",
      thumbnail: "",
      glb: "",
      module: "",
    }
    const g = mockCreateAsset(asset, { season: "winter" })
    expect(g.userData.mockParametric).toBe(true)
    expect(g.children.length).toBeGreaterThan(1)
  })
})