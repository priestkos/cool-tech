import { describe, expect, test } from "bun:test"
import { bm25Score, buildDocFreq, tokenize } from "./bm25"

describe("tokenize", () => {
  test("drops stopwords, single letters, and punctuation", () => {
    expect(tokenize("Where does Ann work?")).toEqual(["ann", "work"])
    expect(tokenize("a an the")).toEqual([])
    expect(tokenize("Ann's tensor")).toEqual(["ann", "tensor"])
  })
})

describe("buildDocFreq", () => {
  test("counts a repeated term once per document", () => {
    const df = buildDocFreq(["Ann Ann Chen", "Ann Labs"])
    expect(df.get("ann")).toBe(2)
    expect(df.get("chen")).toBe(1)
    expect(df.get("labs")).toBe(1)
  })
})

describe("bm25Score", () => {
  test("scores overlapping terms and ignores empty or disjoint documents", () => {
    const docs = ["Ann Chen Person", "Cascade Research Company"]
    const df = buildDocFreq(docs)
    const avg =
      docs.reduce((sum, doc) => sum + tokenize(doc).length, 0) / docs.length
    expect(bm25Score(["ann"], "", avg, df, docs.length)).toBe(0)
    expect(bm25Score(["zephyr"], docs[0] ?? "", avg, df, docs.length)).toBe(0)
    expect(
      bm25Score(["ann", "chen"], docs[0] ?? "", avg, df, docs.length),
    ).toBeGreaterThan(0)
    expect(
      bm25Score(["cascade"], docs[1] ?? "", avg, df, docs.length),
    ).toBeGreaterThan(bm25Score(["ann"], docs[1] ?? "", avg, df, docs.length))
  })
})
