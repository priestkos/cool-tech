import { describe, expect, test } from "bun:test"
import { buildTemplateUrl } from "./types"

describe("buildTemplateUrl", () => {
  test("3d palette and dusk mood", () => {
    const url = buildTemplateUrl("3d", "dusk-violet", true)
    expect(url).toContain("view-3d.html")
    expect(url).toContain("palette=dusk-violet")
    expect(url).toContain("mood=dusk")
  })

  test("2d tilt off", () => {
    const url = buildTemplateUrl("2d", "jungle", false)
    expect(url).toContain("view-2d.html")
    expect(url).toContain("tilt=0")
  })
})