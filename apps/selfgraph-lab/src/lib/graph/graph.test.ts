import { describe, expect, test } from "bun:test"
import { entityId } from "@hydradb/selfgraph"
import {
  SAMPLE_NOTES,
  SAMPLE_SECTIONS,
  UNANSWERABLE_QUESTION,
} from "../../data/sample-notes"
import { companyId, personId } from "./ids"
import { extractFromText } from "./extract"
import { LabGraphStore } from "./store"

describe("deterministic extraction", () => {
  test("sample notes yield expected entities and relations", () => {
    const store = new LabGraphStore()
    for (const section of SAMPLE_SECTIONS) {
      store.ingestDocument(section.text, section.id, section.eventTime, {
        mode: "deterministic",
      })
    }
    expect(store.entities.has(personId("Ann Chen"))).toBe(true)
    expect(store.entities.has(companyId("Northwind Labs"))).toBe(true)
    expect(store.entities.has(companyId("Cascade Research"))).toBe(true)
    const worksAt = store.relations.filter((r) => r.type === "WORKS_AT")
    expect(worksAt.length).toBeGreaterThanOrEqual(2)
  })
})

describe("provenance", () => {
  test("each relation maps to its source passage", () => {
    const result = extractFromText(
      "Ann Chen joined Northwind Labs as a backend engineer.",
      "src-1",
      new Date("2026-03-15T12:00:00Z"),
      { mode: "deterministic" },
    )
    for (const rel of result.relations) {
      const passage = result.passages.find((p) => p.id === rel.passageId)
      expect(passage).toBeDefined()
      expect(passage?.text).toContain("Northwind Labs")
    }
  })
})

describe("supersession and as-of", () => {
  test("contradicting employer retires the old fact", () => {
    const store = new LabGraphStore()
    for (const section of SAMPLE_SECTIONS) {
      store.ingestDocument(section.text, section.id, section.eventTime, {
        mode: "deterministic",
      })
    }
    const ann = personId("Ann Chen")
    const before = store.employerForPersonAt(ann, new Date("2026-04-01T00:00:00Z"))
    const after = store.employerForPersonAt(ann, new Date("2026-07-01T00:00:00Z"))
    expect(before).toBe(companyId("Northwind Labs"))
    expect(after).toBe(companyId("Cascade Research"))
    const retired = store.relations.find(
      (r) => r.toEntity === companyId("Northwind Labs") && !r.isCurrent,
    )
    expect(retired?.invalidatedAt).not.toBeNull()
  })
})

describe("retrieval", () => {
  test("BM25 seeding and traversal on a known question", () => {
    const store = new LabGraphStore()
    store.ingestDocument(SAMPLE_NOTES, "full", new Date("2026-06-02T12:00:00Z"), {
      mode: "deterministic",
    })
    const result = store.retrieve(
      "Where does Ann Chen work?",
      new Date("2026-07-01T00:00:00Z"),
    )
    expect(result.seeds.some((s) => s.entityId === personId("Ann Chen"))).toBe(true)
    expect(result.path.some((p) => p.relationType === "WORKS_AT")).toBe(true)
    expect(result.passages.length).toBeGreaterThan(0)
  })

  test("answerability reports missing terms", () => {
    const store = new LabGraphStore()
    store.ingestDocument(SAMPLE_NOTES, "full", new Date("2026-06-02T12:00:00Z"), {
      mode: "deterministic",
    })
    const result = store.retrieve(
      UNANSWERABLE_QUESTION,
      new Date("2026-07-01T00:00:00Z"),
    )
    expect(result.answerable).toBe(false)
    expect(result.missingTerms.length).toBeGreaterThan(0)
    expect(result.missingTerms).toContain("zephyr")
    expect(result.missingTerms).toContain("tensor")
  })
})

describe("store round-trip", () => {
  test("snapshot JSON preserves graph state", () => {
    const store = new LabGraphStore()
    for (const section of SAMPLE_SECTIONS) {
      store.ingestDocument(section.text, section.id, section.eventTime, {
        mode: "deterministic",
      })
    }
    const json = JSON.stringify(store.toSnapshot())
    const restored = LabGraphStore.fromSnapshot(JSON.parse(json))
    expect(restored.entities.size).toBe(store.entities.size)
    expect(restored.relations.length).toBe(store.relations.length)
    expect(
      restored.employerForPersonAt(
        personId("Ann Chen"),
        new Date("2026-07-01T00:00:00Z"),
      ),
    ).toBe(companyId("Cascade Research"))
  })
})

describe("@hydradb/selfgraph harness", () => {
  test("entityId matches lab person ids", () => {
    expect(entityId("Person", "Ann Chen")).toBe(personId("Ann Chen"))
  })
})