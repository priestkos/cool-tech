import { describe, expect, test } from "bun:test"
import { buildSrtSettings, defaultPolicyToggles } from "./settings.ts"

describe("buildSrtSettings", () => {
  test("default policy matches MVP expectations", () => {
    const settings = buildSrtSettings(defaultPolicyToggles())
    expect(settings.filesystem.allowWrite).toContain(".")
    expect(settings.filesystem.denyRead).toContain("~/.ssh")
    expect(settings.network.allowedDomains).toContain("github.com")
  })

  test("write toggle adds path to allowWrite", () => {
    const toggles = defaultPolicyToggles()
    toggles.folders.tmp.write = true
    const settings = buildSrtSettings(toggles)
    expect(settings.filesystem.allowWrite).toContain("/tmp")
  })
})
