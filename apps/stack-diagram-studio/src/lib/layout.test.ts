import { describe, expect, test } from "bun:test"
import { inferEdges } from "./edges"
import { USER_TILE } from "./diagram-theme"
import { parseStackSentence } from "./parser"

describe("inferEdges", () => {
  test("links client to api", () => {
    const { tiles } = parseStackSentence("Next.js, Hono")
    const edges = inferEdges([USER_TILE, ...tiles], [])
    const client = tiles.find((t) => t.catalogId === "nextjs")
    const api = tiles.find((t) => t.catalogId === "hono")
    expect(edges.some((e) => e.from === client?.instanceId && e.to === api?.instanceId)).toBe(true)
  })
})

describe("layout", () => {
  test("auto layout is deterministic and non-overlapping", async () => {
    const { computeAutoLayout, layoutHasOverlaps } = await import("./layout")
    const { tiles } = parseStackSentence(
      "Next.js on Vercel, Hono API, Postgres on Neon, Clerk auth, Stripe",
    )
    const a = computeAutoLayout([USER_TILE, ...tiles])
    const b = computeAutoLayout([USER_TILE, ...tiles])
    expect(a.positions).toEqual(b.positions)
    expect(layoutHasOverlaps([USER_TILE, ...tiles], a.positions)).toBe(false)
  })
})
