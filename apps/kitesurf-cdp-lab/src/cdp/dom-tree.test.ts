import { describe, expect, test } from "bun:test"
import { buildDomTreeFromDocument, parseAttributePairs } from "./dom-tree"
import { PAGE_LOAD_TRANSCRIPTS } from "../fixtures/transcripts"

describe("buildDomTreeFromDocument", () => {
  test("builds nested tree from DOM.getDocument fixture", () => {
    const entries = PAGE_LOAD_TRANSCRIPTS["kite-intro"]
    const docResponse = entries.find(
      (e) =>
        e.direction === "response" &&
        "result" in e.payload &&
        (e.payload.result as { root?: unknown }).root
    )
    const root = (docResponse?.payload as { result: { root: unknown } }).result.root
    const tree = buildDomTreeFromDocument(root as never)
    expect(tree?.name).toBe("#document")
    const h1 = tree?.children[0]?.children[1]?.children.find((c) => c.name === "h1")
    expect(h1?.value).toBe("Kitesurf CDP Lab")
  })
})

describe("parseAttributePairs", () => {
  test("maps flat attribute list", () => {
    expect(parseAttributePairs(["id", "x", "class", "btn"])).toEqual({
      id: "x",
      class: "btn",
    })
  })
})