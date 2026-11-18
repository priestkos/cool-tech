import { describe, expect, test } from "bun:test"
import {
  parseSceneDocumentJson,
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