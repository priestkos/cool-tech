import { describe, expect, test } from "bun:test"
import {
  parseSceneDocumentJson,
  serializeSceneDocument,
  validateSceneDocument,
  SCENE_DOC_VERSION,
} from "./document"
import { SAMPLE_SCENES } from "./samples"

describe("scene document v2", () => {
  test("rejects invalid JSON", () => {
    const r = parseSceneDocumentJson("{not json")
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]).toContain("JSON parse")
  })

  test("rejects wrong version", () => {
    const r = validateSceneDocument({ version: 1, meta: { name: "x" } })
    expect(r.ok).toBe(false)
  })

  test("all sample scenes validate", () => {
    for (const sample of SAMPLE_SCENES) {
      const r = validateSceneDocument(sample.doc)
      expect(r.ok).toBe(true)
    }
  })

  test("editor round-trip", () => {
    const doc = SAMPLE_SCENES[0].doc
    const text = JSON.stringify(doc)
    const r = parseSceneDocumentJson(text)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.doc.version).toBe(SCENE_DOC_VERSION)
      expect(r.doc.meta.name).toBe(doc.meta.name)
    }
  })
})

function clonedSample() {
  return structuredClone(SAMPLE_SCENES[0].doc)
}

function expectDocumentError(raw: unknown, fragment: string) {
  const result = validateSceneDocument(raw)
  expect(result.ok).toBe(false)
  if (!result.ok) {
    expect(result.errors.some((error) => error.includes(fragment))).toBe(true)
  }
}

describe("scene document rejection paths", () => {
  test("rejects null and array roots", () => {
    expectDocumentError(null, "Root must be an object")
    expectDocumentError([], "Root must be an object")
  })

  test("rejects a JSON array as an invalid document", () => {
    const result = parseSceneDocumentJson("[]")
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((error) => error.includes("Root must be an object"))).toBe(
        true,
      )
    }
  })

  test("rejects an empty meta name", () => {
    const doc = clonedSample()
    doc.meta.name = ""
    expectDocumentError(doc, "meta.name is required")
  })

  test("rejects non-finite sun illuminance", () => {
    const nan = clonedSample()
    nan.environment.sun.illuminanceLux = Number.NaN
    expectDocumentError(nan, "environment.sun.illuminanceLux must be a finite number")

    const infinite = clonedSample()
    infinite.environment.sun.illuminanceLux = Number.POSITIVE_INFINITY
    expectDocumentError(
      infinite,
      "environment.sun.illuminanceLux must be a finite number",
    )
  })

  test("rejects an unknown sky preset", () => {
    const doc = clonedSample()
    ;(doc.environment.sky as { preset: string }).preset = "sunset"
    expectDocumentError(doc, "environment.sky.preset")
  })

  test("rejects non-positive preview exposure", () => {
    for (const exposure of [0, -1, Number.NaN]) {
      const doc = clonedSample()
      doc.preview.exposure = exposure
      expectDocumentError(doc, "preview.exposure must be a positive number")
    }
  })

  test("rejects an unknown tone mapping", () => {
    const doc = clonedSample()
    ;(doc.preview as { toneMapping: string }).toneMapping = "filmic"
    expectDocumentError(doc, "preview.toneMapping")
  })

  test("rejects a zero camera fov", () => {
    const doc = clonedSample()
    doc.camera.fov = 0
    expectDocumentError(doc, "camera.fov")
  })

  test("rejects a non-finite camera position", () => {
    const doc = clonedSample()
    doc.camera.position = [0, Number.NaN, 1]
    expectDocumentError(doc, "camera.position")
  })

  test("rejects a short camera lookAt", () => {
    const doc = clonedSample()
    doc.camera.lookAt = [0, 1] as typeof doc.camera.lookAt
    expectDocumentError(doc, "camera.lookAt")
  })

  test("rejects a duplicated mesh id", () => {
    const doc = clonedSample()
    doc.meshes[0]!.id = doc.meshes[1]!.id
    expectDocumentError(doc, "duplicate mesh id")
  })

  test("rejects an unknown mesh geometry", () => {
    const doc = clonedSample()
    ;(doc.meshes[0] as { geometry: string }).geometry = "torus"
    expectDocumentError(doc, "geometry invalid")
  })

  test("rejects a mesh material without a color", () => {
    const doc = clonedSample()
    ;(doc.meshes[0] as { material: Record<string, unknown> }).material = {}
    expectDocumentError(doc, "material.color")
  })

  test("rejects a null mesh entry", () => {
    const doc = clonedSample()
    doc.meshes = [null] as unknown as typeof doc.meshes
    expectDocumentError(doc, "meshes[0] must be an object")
  })

  test("rejects lights that are not an array", () => {
    const doc = clonedSample()
    ;(doc as { lights: unknown }).lights = null
    expectDocumentError(doc, "lights must be an array")
  })

  test("rejects a duplicated light id", () => {
    const doc = clonedSample()
    doc.lights = [
      { id: "lamp", type: "point", position: [0, 1, 0], intensityCd: 1 },
      { id: "lamp", type: "point", position: [1, 1, 0], intensityCd: 2 },
    ]
    expectDocumentError(doc, "duplicate light id")
  })

  test("rejects a negative point light intensity", () => {
    const doc = clonedSample()
    doc.lights = [
      { id: "lamp", type: "point", position: [0, 1, 0], intensityCd: -1 },
    ]
    expectDocumentError(doc, "intensityCd must be non-negative")
  })

  test("rejects an ambient light type", () => {
    const doc = clonedSample()
    ;(doc as { lights: unknown }).lights = [
      { id: "fill", type: "ambient", position: [0, 1, 0], intensityCd: 1 },
    ]
    expectDocumentError(doc, "type must be point or spot")
  })

  test("rejects a spot light without angleDeg", () => {
    const doc = clonedSample()
    ;(doc as { lights: unknown }).lights = [
      { id: "key", type: "spot", position: [0, 2, 0], intensityCd: 4 },
    ]
    expectDocumentError(doc, "angleDeg")
  })

  test("accepts a point light with zero intensity", () => {
    const doc = clonedSample()
    doc.lights = [
      { id: "lamp", type: "point", position: [0, 1, 0], intensityCd: 0 },
    ]
    const result = validateSceneDocument(doc)
    expect(result.ok).toBe(true)
  })

  test("pretty-prints a sample document", () => {
    const text = serializeSceneDocument(SAMPLE_SCENES[0].doc)
    expect(text.includes("\n")).toBe(true)
    expect(text.includes('"version": 2')).toBe(true)
  })
})