import { describe, expect, test } from "bun:test"
import {
  DirectionalLight,
  RecordingEngine,
  SceneBinding,
  lightDesc,
} from "@threert/scene"
import { buildThreertScene } from "./build"
import { SAMPLE_SCENES } from "./samples"

describe("@threert/scene build + binding", () => {
  test("sun uses lux and setSunAngles", () => {
    const built = buildThreertScene(SAMPLE_SCENES[0].doc)
    expect(built.sun).toBeInstanceOf(DirectionalLight)
    expect(built.sun.intensity).toBe(90_000)
    const desc = lightDesc(built.sun)
    expect(desc.type).toBe("directional")
    if (desc.type === "directional") {
      expect(desc.intensity).toBe(90_000)
    }
  })

  test("SceneBinding sync records mesh objects", () => {
    const built = buildThreertScene(SAMPLE_SCENES[0].doc)
    const engine = new RecordingEngine()
    const binding = new SceneBinding(engine, built.scene, built.camera)
    binding.sync()
    const calls = engine.take()
    const objects = calls.filter((c) => c[0] === "object")
    expect(objects.length).toBeGreaterThan(3)
    const meshKinds = objects
      .map((c) => (c[2] as { kind?: string }).kind)
      .filter((k) => k === "mesh")
    expect(meshKinds.length).toBeGreaterThan(0)
  })

  test("night street has point lights in cd", () => {
    const sample = SAMPLE_SCENES.find((s) => s.slug === "night-street")!
    const built = buildThreertScene(sample.doc)
    const engine = new RecordingEngine()
    const binding = new SceneBinding(engine, built.scene, built.camera)
    binding.sync()
    const lightObjects = engine
      .take()
      .filter((c) => c[0] === "object")
      .map((c) => c[2] as { kind?: string; light?: { type: string; intensity: number } })
      .filter((d) => d.kind === "light")
    expect(lightObjects.length).toBeGreaterThanOrEqual(2)
    const point = lightObjects.find((d) => d.light?.type === "point")
    expect(point).toBeDefined()
    expect(point?.light?.intensity).toBe(18_000)
  })

  test("patching sun lux rebuilds intensity", () => {
    const doc = { ...SAMPLE_SCENES[0].doc }
    doc.environment = {
      ...doc.environment,
      sun: { ...doc.environment.sun, illuminanceLux: 42_000 },
    }
    const built = buildThreertScene(doc)
    expect(built.sun.intensity).toBe(42_000)
  })
})