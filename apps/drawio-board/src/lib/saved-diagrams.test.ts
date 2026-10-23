import { describe, expect, it } from "vitest"
import {
  createSavedDiagram,
  deleteSavedDiagram,
  renameSavedDiagram,
  upsertSavedDiagram,
} from "./saved-diagrams"

describe("saved-diagrams", () => {
  it("creates a diagram with a trimmed name", () => {
    const d = createSavedDiagram("  My chart  ", "<mxfile/>")
    expect(d.name).toBe("My chart")
    expect(d.xml).toBe("<mxfile/>")
  })

  it("renames and deletes by id", () => {
    const a = createSavedDiagram("A", "1")
    const b = createSavedDiagram("B", "2")
    const renamed = renameSavedDiagram([a, b], a.id, "Alpha")
    expect(renamed[0]?.name).toBe("Alpha")
    const remaining = deleteSavedDiagram(renamed, a.id)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.id).toBe(b.id)
  })

  it("upserts by id", () => {
    const a = createSavedDiagram("A", "1")
    const updated = { ...a, xml: "2", updatedAt: 99 }
    const list = upsertSavedDiagram([a], updated)
    expect(list).toHaveLength(1)
    expect(list[0]?.xml).toBe("2")
    const added = upsertSavedDiagram(list, createSavedDiagram("C", "3"))
    expect(added).toHaveLength(2)
  })
})
