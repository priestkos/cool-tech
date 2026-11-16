import { describe, expect, test } from "bun:test"
import { buildDomTreeFromDocument, flattenDomTree, parseAttributePairs } from "./dom-tree"
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

  test("drops a dangling key and accepts missing attributes", () => {
    expect(parseAttributePairs(undefined)).toEqual({})
    expect(parseAttributePairs([])).toEqual({})
    expect(parseAttributePairs(["id", "main", "class"])).toEqual({ id: "main" })
  })
})

describe("dom tree edges", () => {
  test("prefers localName, skips empty values, and flattens nesting", () => {
    expect(buildDomTreeFromDocument(undefined)).toBeNull()
    expect(flattenDomTree(null)).toEqual([])
    const tree = buildDomTreeFromDocument({
      nodeId: 1,
      nodeName: "DIV",
      localName: "div",
      attributes: ["id", "main", "class"],
      nodeValue: "",
      children: [
        {
          nodeId: 2,
          nodeName: "#text",
          localName: "",
          nodeValue: "Hi",
          attributes: ["alt"],
        },
      ],
    })
    expect(tree?.name).toBe("div")
    expect(tree?.value).toBeUndefined()
    expect(tree?.attributes).toEqual({ id: "main" })
    expect(tree?.children[0]?.name).toBe("#text")
    expect(tree?.children[0]?.value).toBe("Hi")
    expect(tree?.children[0]?.attributes).toEqual({})
    expect(flattenDomTree(tree)).toEqual(['<div id="main">', "  <#text>Hi"])
  })
})