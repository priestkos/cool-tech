import { describe, expect, test } from "bun:test"
import { parseStackSentence } from "./parser"

describe("parseStackSentence", () => {
  test("matches aliases case-insensitively", () => {
    const a = parseStackSentence("Next.js on Vercel, hono api, postgres on neon")
    const b = parseStackSentence("NEXT.JS ON VERCEL, Hono API, POSTGRES ON NEON")
    expect(a.tiles.map((t) => t.catalogId).sort()).toEqual(b.tiles.map((t) => t.catalogId).sort())
  })

  test("creates hosting edges for X on Y", () => {
    const { edges } = parseStackSentence("Postgres on Neon")
    expect(edges.some((e) => e.kind === "hosts")).toBe(true)
  })

  test("unknown words become editable tiles", () => {
    const { tiles } = parseStackSentence("Foobarium service")
    expect(tiles.some((t) => t.isUnknown && t.label.toLowerCase().includes("foobarium"))).toBe(
      true,
    )
  })

  test("empty and garbage input never throws", () => {
    expect(() => parseStackSentence("")).not.toThrow()
    expect(() => parseStackSentence("!!! ???")).not.toThrow()
    expect(parseStackSentence("").tiles).toEqual([])
  })

  test("deterministic output", () => {
    const sentence = "Bun, Hono, SQLite"
    const first = JSON.stringify(parseStackSentence(sentence))
    const second = JSON.stringify(parseStackSentence(sentence))
    expect(first).toBe(second)
  })
})
