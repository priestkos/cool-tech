import { describe, expect, test } from "bun:test"
import { buildSrtSettings, defaultPolicyToggles } from "./settings.ts"
import { evaluatePresetMock, isNetworkAllowed } from "./mock-policy.ts"
import { PRESETS } from "./presets.ts"

describe("mock policy", () => {
  test("blocks ~/.ssh read by default", () => {
    const settings = buildSrtSettings(defaultPolicyToggles())
    const preset = PRESETS.find((p) => p.id === "read-ssh")!
    const result = evaluatePresetMock(preset, settings, "/home/demo")
    expect(result.allowed).toBe(false)
  })

  test("allow-only network blocks example.com when only github allowed", () => {
    const settings = buildSrtSettings(defaultPolicyToggles())
    const blocked = isNetworkAllowed("https://example.com", settings)
    expect(blocked.allowed).toBe(false)
    const allowed = isNetworkAllowed("https://github.com", settings)
    expect(allowed.allowed).toBe(true)
  })

  test("empty allowedDomains denies all network", () => {
    const settings = buildSrtSettings(defaultPolicyToggles())
    settings.network.allowedDomains = []
    const result = isNetworkAllowed("https://github.com", settings)
    expect(result.allowed).toBe(false)
  })
})
