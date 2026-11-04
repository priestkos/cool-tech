import { describe, expect, test } from "bun:test"
import { composeDiagramSvg, composeStandaloneHtml } from "./export"
import { USER_TILE } from "./diagram-theme"
import { inferEdges } from "./edges"
import { computeAutoLayout } from "./layout"
import { parseStackSentence } from "./parser"

describe("export composer", () => {
  test("produces well-formed SVG/HTML without external URLs", () => {
    const sentence = "Bun, Hono, SQLite"
    const { tiles, edges: parsedEdges } = parseStackSentence(sentence)
    const allTiles = [USER_TILE, ...tiles]
    const edges = inferEdges(allTiles, parsedEdges)
    const layout = computeAutoLayout(allTiles)
    const input = {
      tiles,
      edges,
      positions: layout.positions,
      layout,
      diagramTheme: "light" as const,
    }
    const svg = composeDiagramSvg(input)
    expect(svg.startsWith("<?xml")).toBe(true)
    expect(svg.includes('href="http')).toBe(false)
    expect(svg.includes('src="http')).toBe(false)
    expect(svg.includes("fonts.googleapis")).toBe(false)
    const html = composeStandaloneHtml(input, "Test stack")
    expect(html.includes("<!DOCTYPE html>")).toBe(true)
    expect(html.includes('href="http')).toBe(false)
    expect(html.includes('src="http')).toBe(false)
  })

  test("deterministic svg for same input", () => {
    const { tiles, edges: parsedEdges } = parseStackSentence("Rails, Postgres, Redis")
    const allTiles = [USER_TILE, ...tiles]
    const edges = inferEdges(allTiles, parsedEdges)
    const layout = computeAutoLayout(allTiles)
    const input = {
      tiles,
      edges,
      positions: layout.positions,
      layout,
      diagramTheme: "light" as const,
    }
    expect(composeDiagramSvg(input)).toBe(composeDiagramSvg(input))
  })
})
