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

  test("lantern-night sets mood=night on the 3d view", () => {
    const url = buildTemplateUrl("3d", "lantern-night", false)
    expect(url).toContain("mood=night")
    expect(url).toContain("view-3d.html")
  })

  test("golden-hour sets mood=golden", () => {
    const url = buildTemplateUrl("3d", "golden-hour", false)
    expect(url).toContain("mood=golden")
  })

  test("jungle in 3d has no mood", () => {
    const url = buildTemplateUrl("3d", "jungle", false)
    expect(url.includes("mood=")).toBe(false)
  })

  test("2d tilt on", () => {
    const url = buildTemplateUrl("2d", "jungle", true)
    expect(url).toContain("tilt=9")
  })

  test("explicit base prefixes the 3d view", () => {
    const url = buildTemplateUrl("3d", "dusk-violet", false, "/apps/papercraft-studio/")
    expect(url.startsWith("/apps/papercraft-studio/view-3d.html?")).toBe(true)
  })

  test("root base prefixes the 2d view", () => {
    const url = buildTemplateUrl("2d", "jungle", false, "/")
    expect(url.startsWith("/view-2d.html?")).toBe(true)
  })
})