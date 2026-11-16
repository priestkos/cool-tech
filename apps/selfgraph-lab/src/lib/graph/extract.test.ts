import { describe, expect, test } from "bun:test"
import { companyId, personId } from "./ids"
import { extractFromText } from "./extract"

const at = new Date("2026-03-15T12:00:00Z")

describe("extractFromText patterns", () => {
  test("blank text yields no passages or facts", () => {
    const result = extractFromText("  \n\t ", "blank", at, {
      mode: "deterministic",
    })
    expect(result.passages).toEqual([])
    expect(result.entities).toEqual([])
    expect(result.relations).toEqual([])
  })

  test("unrecognized sentences keep a passage and no relations", () => {
    const result = extractFromText("Hello.", "note", at, {
      mode: "deterministic",
    })
    expect(result.relations).toEqual([])
    expect(result.entities).toEqual([])
    expect(result.passages).toEqual([
      {
        id: "passage:note:0",
        sourceId: "note",
        text: "Hello.",
        startOffset: 0,
        endOffset: 6,
      },
    ])
  })

  test("reports-to links both people to the source passage", () => {
    const result = extractFromText(
      "Ann Chen reports to Marco Silva at the Seattle office.",
      "note",
      at,
      { mode: "deterministic" },
    )
    expect(result.relations).toHaveLength(1)
    const rel = result.relations[0]
    expect(rel?.type).toBe("REPORTS_TO")
    expect(rel?.fromEntity).toBe(personId("Ann Chen"))
    expect(rel?.toEntity).toBe(personId("Marco Silva"))
    expect(rel?.isCurrent).toBe(true)
    expect(rel?.invalidatedAt).toBeNull()
    const passage = result.passages.find((p) => p.id === rel?.passageId)
    expect(passage?.text).toContain("Marco Silva")
    expect(result.entities.map((e) => e.id).sort()).toEqual(
      [personId("Ann Chen"), personId("Marco Silva")].sort(),
    )
  })

  test("a later move in the same note retires the earlier employer", () => {
    const text =
      "Ann Chen joined Northwind Labs as a backend engineer. Ann Chen left Northwind Labs and started at Cascade Research."
    const result = extractFromText(text, "note", at, { mode: "deterministic" })
    const works = result.relations.filter((r) => r.type === "WORKS_AT")
    expect(works).toHaveLength(2)
    const current = works.filter((r) => r.isCurrent)
    expect(current).toHaveLength(1)
    expect(current[0]?.toEntity).toBe(companyId("Cascade Research"))
    const retired = works.find((r) => !r.isCurrent)
    expect(retired?.toEntity).toBe(companyId("Northwind Labs"))
    expect(retired?.invalidatedAt).toEqual(at)
  })

  test("mock-llm adds at most three thing entities without dropping facts", () => {
    const result = extractFromText(
      "Ann Chen joined Northwind Labs as a backend engineer.",
      "note",
      at,
      { mode: "mock-llm" },
    )
    expect(result.relations.some((r) => r.type === "WORKS_AT")).toBe(true)
    const things = result.entities.filter((e) => e.type === "Thing")
    expect(things).toHaveLength(3)
    expect(things.map((entity) => entity.id)).toEqual([
      "thing:ann",
      "thing:chen",
      "thing:northwind",
    ])
    expect(result.entities.some((e) => e.id === personId("Ann Chen"))).toBe(true)
    expect(result.entities.some((e) => e.id === companyId("Northwind Labs"))).toBe(
      true,
    )
  })
})

describe("entity ids", () => {
  test("slugs collapse whitespace and case", () => {
    expect(personId("  Ann   Chen ")).toBe("person:ann-chen")
    expect(companyId("Northwind Labs")).toBe("company:northwind-labs")
  })
})
