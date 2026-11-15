import { describe, expect, test } from "bun:test"
import {
  parseSceneLabJson,
  validateSceneLabJson,
  SCENE_LAB_VERSION,
  type SceneLabFile,
} from "./schema"
import { SAMPLE_SCENES } from "./samples"

function cloneNoon(): SceneLabFile {
  return structuredClone(SAMPLE_SCENES[0]!.scene)
}

function errorText(raw: unknown): string {
  const result = validateSceneLabJson(raw)
  expect(result.ok).toBe(false)
  if (result.ok) return ""
  return result.errors.join("\n")
}

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

  test("rejects a non-object document", () => {
    expect(errorText(null)).toContain("Root must be an object")
    expect(errorText([])).toContain("Root must be an object")
    expect(errorText("scene")).toContain("Root must be an object")
  })

  test("rejects a missing name and a broken environment", () => {
    const missingName = cloneNoon()
    missingName.meta.name = ""
    expect(errorText(missingName)).toContain("meta.name is required")

    const noSun = cloneNoon()
    delete (noSun.environment as { sun?: unknown }).sun
    expect(errorText(noSun)).toContain("environment.sun required")

    const badElevation = cloneNoon()
    badElevation.environment.sun.elevationDeg = -16
    expect(errorText(badElevation)).toContain("between -15")
    badElevation.environment.sun.elevationDeg = 91
    expect(errorText(badElevation)).toContain("between -15")
    badElevation.environment.sun.elevationDeg = Number.NaN
    expect(errorText(badElevation)).toContain("elevationDeg must be a finite number")

    const badSky = cloneNoon()
    badSky.environment.sky.preset = "sunset" as "clear"
    expect(errorText(badSky)).toContain("environment.sky.preset must be one of")

    const badHemi = cloneNoon()
    badHemi.environment.hemisphereLux = Number.POSITIVE_INFINITY
    expect(errorText(badHemi)).toContain("hemisphereLux must be a finite number")
  })

  test("accepts sun elevation at the documented bounds", () => {
    const low = cloneNoon()
    low.environment.sun.elevationDeg = -15
    const high = cloneNoon()
    high.environment.sun.elevationDeg = 90
    expect(validateSceneLabJson(low).ok).toBe(true)
    expect(validateSceneLabJson(high).ok).toBe(true)
  })

  test("rejects renderer exposure and tone mapping", () => {
    const zero = cloneNoon()
    zero.renderer.exposure = 0
    expect(errorText(zero)).toContain("exposure must be a positive number")

    const negative = cloneNoon()
    negative.renderer.exposure = -0.2
    expect(errorText(negative)).toContain("exposure must be a positive number")

    const mapping = cloneNoon()
    mapping.renderer.toneMapping = "filmic" as "aces"
    expect(errorText(mapping)).toContain("toneMapping must be one of")
  })

  test("rejects duplicate meshes and invalid transforms", () => {
    const dup = cloneNoon()
    dup.meshes[1]!.id = dup.meshes[0]!.id
    expect(errorText(dup)).toContain(`duplicate mesh id: ${dup.meshes[0]!.id}`)

    const geo = cloneNoon()
    geo.meshes[0]!.geometry = "torus" as "box"
    expect(errorText(geo)).toContain("geometry invalid")

    const pos = cloneNoon()
    pos.meshes[0]!.position = [0, Number.NaN, 0]
    expect(errorText(pos)).toContain("position must be [x,y,z]")

    const rot = cloneNoon()
    rot.meshes[0]!.rotation = [0, 1] as unknown as SceneLabFile["meshes"][number]["rotation"]
    expect(errorText(rot)).toContain("rotation must be [x,y,z]")

    const color = cloneNoon()
    color.meshes[0]!.material.color = ""
    expect(errorText(color)).toContain("material.color required")
  })

  test("rejects bad lights and accepts a zero-lumen point light", () => {
    const dup = cloneNoon()
    dup.lights = [
      { id: "a", type: "point", position: [0, 1, 0], luminousFluxLm: 10 },
      { id: "a", type: "point", position: [1, 1, 0], luminousFluxLm: 10 },
    ]
    expect(errorText(dup)).toContain("duplicate light id: a")

    const negative = cloneNoon()
    negative.lights = [
      { id: "a", type: "point", position: [0, 1, 0], luminousFluxLm: -1 },
    ]
    expect(errorText(negative)).toContain("luminousFluxLm must be a non-negative number")

    const spot = cloneNoon()
    spot.lights = [
      {
        id: "key",
        type: "spot",
        position: [0, 2, 0],
        intensityCd: -5,
        angleDeg: undefined as unknown as number,
      },
    ]
    const spotErrors = errorText(spot)
    expect(spotErrors).toContain("intensityCd must be non-negative")
    expect(spotErrors).toContain("angleDeg required")

    const unknown = cloneNoon()
    unknown.lights = [
      { id: "area", type: "area" } as unknown as SceneLabFile["lights"][number],
    ]
    expect(errorText(unknown)).toContain("type must be point or spot")

    const zero = cloneNoon()
    zero.lights = [
      { id: "off", type: "point", position: [0, 1, 0], luminousFluxLm: 0 },
    ]
    expect(validateSceneLabJson(zero).ok).toBe(true)
  })
})
