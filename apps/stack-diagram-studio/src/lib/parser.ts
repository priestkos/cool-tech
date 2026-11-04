import { findCatalogSpan, lookupCatalog, normalizeToken } from "./catalog"
import type { DiagramEdge, DiagramTile, ParseResult } from "./types"

function catalogInstanceId(catalogId: string): string {
  return `inst:${catalogId}`
}

function unknownInstanceId(raw: string): string {
  return `inst:unknown:${normalizeToken(raw) || "item"}`
}

function tokenize(sentence: string): string[] {
  const norm = normalizeToken(sentence)
  if (!norm) return []
  return norm.split(" ")
}

function splitClauses(sentence: string): string[] {
  return sentence
    .split(/[,;]+|\band\b/gi)
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseOnRelation(clause: string): { left: string; right: string } | null {
  const match = clause.match(/^(.+?)\s+on\s+(.+)$/i)
  if (!match) return null
  return { left: match[1]!.trim(), right: match[2]!.trim() }
}

function tileFromCatalog(entry: NonNullable<ReturnType<typeof lookupCatalog>>): DiagramTile {
  return {
    instanceId: catalogInstanceId(entry.id),
    catalogId: entry.id,
    label: entry.label,
    monogram: entry.monogram,
    category: entry.category,
  }
}

function unknownTile(raw: string): DiagramTile {
  const label = raw.trim() || "Unknown"
  const monogram = label.slice(0, 2).replace(/[^a-zA-Z0-9]/g, "") || "?"
  return {
    instanceId: unknownInstanceId(label),
    catalogId: null,
    label,
    monogram: monogram.slice(0, 2).toUpperCase(),
    category: "other",
    isUnknown: true,
  }
}

function consumePhrase(text: string, seen: Set<string>): DiagramTile[] {
  const tokens = tokenize(text)
  const tiles: DiagramTile[] = []
  let i = 0
  while (i < tokens.length) {
    const span = findCatalogSpan(tokens, i)
    if (span) {
      if (!seen.has(span.entry.id)) {
        seen.add(span.entry.id)
        tiles.push({
          instanceId: catalogInstanceId(span.entry.id),
          catalogId: span.entry.id,
          label: span.entry.label,
          monogram: span.entry.monogram,
          category: span.entry.category,
        })
      }
      i += span.length
      continue
    }
    const word = tokens[i]!
    if (word.length > 1 && !["with", "using", "via", "the", "a", "an"].includes(word)) {
      const id = `unknown:${word}`
      if (!seen.has(id)) {
        seen.add(id)
        tiles.push(unknownTile(word))
      }
    }
    i += 1
  }
  return tiles
}

function findTileByCatalogId(tiles: DiagramTile[], catalogId: string): DiagramTile | undefined {
  return tiles.find((t) => t.catalogId === catalogId)
}

function resolveSide(text: string, tiles: DiagramTile[]): DiagramTile | null {
  const entry = lookupCatalog(text)
  if (entry) {
    const existing = findTileByCatalogId(tiles, entry.id)
    if (existing) return existing
    const tile = tileFromCatalog(entry)
    tiles.push(tile)
    return tile
  }
  const tokens = tokenize(text)
  for (let i = 0; i < tokens.length; i++) {
    const span = findCatalogSpan(tokens, i)
    if (span) {
      let existing = findTileByCatalogId(tiles, span.entry.id)
      if (!existing) {
        existing = {
          instanceId: catalogInstanceId(span.entry.id),
          catalogId: span.entry.id,
          label: span.entry.label,
          monogram: span.entry.monogram,
          category: span.entry.category,
        }
        tiles.push(existing)
      }
      return existing
    }
  }
  return null
}

/** Deterministic parse: catalog matches, "X on Y" hosting edges, unknown tokens as editable tiles. */
export function parseStackSentence(sentence: string): ParseResult {
  const trimmed = sentence.trim()
  if (!trimmed) {
    return { tiles: [], edges: [] }
  }

  const tiles: DiagramTile[] = []
  const edges: DiagramEdge[] = []
  const seen = new Set<string>()
  const clauses = splitClauses(trimmed)

  for (const clause of clauses) {
    const onRel = parseOnRelation(clause)
    if (onRel) {
      const leftTile = resolveSide(onRel.left, tiles)
      const rightTile = resolveSide(onRel.right, tiles)
      if (leftTile && rightTile) {
        edges.push({ from: leftTile.instanceId, to: rightTile.instanceId, kind: "hosts" })
      }
      continue
    }
    tiles.push(...consumePhrase(clause, seen))
  }

  return { tiles, edges }
}
