import type { DiagramEdge, DiagramTile, EdgeKind, TileCategory } from "./types"

const layerOf = (category: TileCategory): number => {
  switch (category) {
    case "user":
      return 0
    case "client":
      return 1
    case "hosting":
      return 2
    case "api":
      return 3
    case "database":
    case "auth":
    case "payments":
    case "storage":
    case "queue":
    case "observability":
    case "other":
      return 4
    default: {
      const _exhaustive: never = category
      return _exhaustive
    }
  }
}

function addEdge(
  edges: DiagramEdge[],
  seen: Set<string>,
  from: string,
  to: string,
  kind: EdgeKind,
): void {
  if (from === to) return
  const key = `${from}|${to}|${kind}`
  if (seen.has(key)) return
  seen.add(key)
  edges.push({ from, to, kind })
}

/** Infer architecture edges from categories plus explicit hosting relations from the parser. */
export function inferEdges(tiles: DiagramTile[], parsedEdges: DiagramEdge[]): DiagramEdge[] {
  const edges: DiagramEdge[] = [...parsedEdges]
  const seen = new Set(parsedEdges.map((e) => `${e.from}|${e.to}|${e.kind}`))

  const clients = tiles.filter((t) => t.category === "client")
  const user = tiles.find((t) => t.category === "user")
  const apis = tiles.filter((t) => t.category === "api")
  const hosting = tiles.filter((t) => t.category === "hosting")
  const dataLike = tiles.filter((t) =>
    ["database", "auth", "payments", "storage", "queue", "observability", "other"].includes(
      t.category,
    ),
  )

  if (user) {
    for (const c of clients) {
      addEdge(edges, seen, user.instanceId, c.instanceId, "calls")
    }
  }

  for (const c of clients) {
    for (const a of apis) {
      addEdge(edges, seen, c.instanceId, a.instanceId, "calls")
    }
    for (const h of hosting) {
      addEdge(edges, seen, c.instanceId, h.instanceId, "uses")
    }
  }

  for (const a of apis) {
    for (const d of dataLike) {
      addEdge(edges, seen, a.instanceId, d.instanceId, "uses")
    }
    for (const h of hosting) {
      addEdge(edges, seen, a.instanceId, h.instanceId, "uses")
    }
  }

  for (const h of hosting) {
    for (const d of dataLike) {
      if (d.category === "database") {
        addEdge(edges, seen, h.instanceId, d.instanceId, "uses")
      }
    }
  }

  // Stable sort for determinism
  edges.sort((a, b) => {
    const af = a.from.localeCompare(b.from)
    if (af !== 0) return af
    const at = a.to.localeCompare(b.to)
    if (at !== 0) return at
    return a.kind.localeCompare(b.kind)
  })

  return edges
}

export { layerOf }
