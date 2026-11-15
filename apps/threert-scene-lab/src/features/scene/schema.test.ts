import { describe, expect, test } from "bun:test"
import { parseSceneLabJson, validateSceneLabJson, SCENE_LAB_VERSION } from "./schema"
import { SAMPLE_SCENES } from "./samples"

describe("scene schema", () => {
  test("rejects invalid JSON", () => {
    const r = parseSceneLabJson("{not json")
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]).toContain("JSON parse")
  })

  test("rejects wrong version", () => {
    const r = validateSceneLabJson({ version: 2, meta: { name: "x" } })
    expect(r.ok).toBe(false)
  })

  test("all sample scenes validate", () => {
    for (const sample of SAMPLE_SCENES) {
      const r = validateSceneLabJson(sample.scene)
      expect(r.ok).toBe(true)
    }
  })

  test("editor round-trip", () => {
    const scene = SAMPLE_SCENES[0].scene
    const text = JSON.stringify(scene)
    const r = parseSceneLabJson(text)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.scene.version).toBe(SCENE_LAB_VERSION)
      expect(r.scene.meta.name).toBe(scene.meta.name)
    }
  })
})