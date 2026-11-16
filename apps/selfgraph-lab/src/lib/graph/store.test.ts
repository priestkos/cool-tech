import { describe, expect, test } from "bun:test"
import { SAMPLE_SECTIONS } from "../../data/sample-notes"
import { companyId, personId } from "./ids"
import { LabGraphStore } from "./store"

function ingestedSample(): LabGraphStore {
  const store = new LabGraphStore()
  for (const section of SAMPLE_SECTIONS) {
    store.ingestDocument(section.text, section.id, section.eventTime, {
      mode: "deterministic",
    })
  }
  return store
}

describe("as-of boundaries", () => {
  test("employer changes at the invalidation instant and not before", () => {
    const store = ingestedSample()
    const ann = personId("Ann Chen")
    const change = new Date("2026-06-02T12:00:00Z")
    const justBefore = new Date(change.getTime() - 1)

    expect(store.employerForPersonAt(ann, new Date("2026-01-01T00:00:00Z"))).toBeNull()
    expect(store.employerForPersonAt(ann, new Date("2026-03-15T12:00:00Z"))).toBe(
      companyId("Northwind Labs"),
    )
    expect(store.employerForPersonAt(ann, justBefore)).toBe(
      companyId("Northwind Labs"),
    )
    expect(store.employerForPersonAt(ann, change)).toBe(
      companyId("Cascade Research"),
    )

    const currentWorks = store
      .currentRelations()
      .filter((rel) => rel.fromEntity === ann && rel.type === "WORKS_AT")
    expect(currentWorks).toHaveLength(1)
    expect(currentWorks[0]?.toEntity).toBe(companyId("Cascade Research"))

    const reports = store
      .relationsAsOf(new Date("2026-07-01T00:00:00Z"))
      .filter((rel) => rel.type === "REPORTS_TO")
    expect(reports.map((rel) => rel.toEntity)).toContain(personId("Marco Silva"))
  })

  test("retrieval hides employer edges that are not valid yet", () => {
    const store = ingestedSample()
    const result = store.retrieve("Ann Chen", new Date("2026-04-01T00:00:00Z"))
    const employers = result.path
      .filter((step) => step.relationType === "WORKS_AT")
      .map((step) => step.toId)
    expect(new Set(employers)).toEqual(new Set([companyId("Northwind Labs")]))
    const visited = result.path.flatMap((step) => [step.fromId, step.toId])
    expect(visited).not.toContain(companyId("Cascade Research"))
  })

  test("a question is answerable only when every term is in the graph", () => {
    const store = ingestedSample()
    const result = store.retrieve(
      "Ann Chen Cascade",
      new Date("2026-07-01T00:00:00Z"),
    )
    expect(result.missingTerms).toEqual([])
    expect(result.seeds.length).toBeGreaterThan(0)
    expect(result.answerable).toBe(true)
  })
})

describe("snapshot dates", () => {
  test("restores relation instants used by as-of queries", () => {
    const store = ingestedSample()
    const ann = personId("Ann Chen")
    const change = new Date("2026-06-02T12:00:00Z")
    const justBefore = new Date(change.getTime() - 1)
    const restored = LabGraphStore.fromSnapshot(
      JSON.parse(JSON.stringify(store.toSnapshot())),
    )

    for (const rel of restored.relations) {
      expect(rel.createdAt).toBeInstanceOf(Date)
      expect(rel.eventTime).toBeInstanceOf(Date)
      if (rel.invalidatedAt) expect(rel.invalidatedAt).toBeInstanceOf(Date)
    }
    expect(restored.employerForPersonAt(ann, justBefore)).toBe(
      companyId("Northwind Labs"),
    )
    expect(restored.employerForPersonAt(ann, change)).toBe(
      companyId("Cascade Research"),
    )
  })
})

describe("passage lookup and clear", () => {
  test("passageForRelation returns the cited passage", () => {
    const store = ingestedSample()
    const reports = store.relations.find((rel) => rel.type === "REPORTS_TO")
    expect(reports).toBeDefined()
    expect(store.passageForRelation(reports?.id ?? "").text).toContain("Marco Silva")
    expect(store.passageForRelation("missing")).toBeUndefined()
  })

  test("clear drops entities, relations, passages, and source text", () => {
    const store = ingestedSample()
    store.clear()
    expect(store.entities.size).toBe(0)
    expect(store.relations).toEqual([])
    expect(store.passages.size).toBe(0)
    expect(store.sourceText).toBe("")
    expect(
      store.employerForPersonAt(
        personId("Ann Chen"),
        new Date("2026-07-01T00:00:00Z"),
      ),
    ).toBeNull()
  })
})
