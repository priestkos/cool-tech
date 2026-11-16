import { bm25Score, buildDocFreq, tokenize } from "./bm25"
import type {
  LabEntity,
  LabRelation,
  Passage,
  RetrievalResult,
  RetrievalSeed,
  TraversalStep,
} from "./types"

function relationsAsOf(relations: LabRelation[], asOf: Date): LabRelation[] {
  return relations.filter((rel) => {
    if (rel.createdAt > asOf) return false
    if (rel.invalidatedAt && rel.invalidatedAt <= asOf) return false
    return true
  })
}

export function retrieveFromGraph(
  query: string,
  asOf: Date,
  entities: Map<string, LabEntity>,
  relations: LabRelation[],
  passages: Map<string, Passage>,
): RetrievalResult {
  const queryTerms = tokenize(query)
  const entityList = [...entities.values()]
  const docs = entityList.map((e) => `${e.name} ${e.type} ${e.id}`)
  const passagesText = [...passages.values()].map((p) => p.text)
  const corpus = [...docs, ...passagesText]
  const df = buildDocFreq(corpus)
  const avgLen =
    corpus.reduce((sum, d) => sum + tokenize(d).length, 0) /
    Math.max(corpus.length, 1)

  const seeds: RetrievalSeed[] = entityList
    .map((entity) => {
      const text = `${entity.name} ${entity.type}`
      const score = bm25Score(queryTerms, text, avgLen, df, corpus.length)
      return { entityId: entity.id, score, label: entity.name }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  const active = relationsAsOf(relations, asOf)
  const path: TraversalStep[] = []
  const visited = new Set<string>()
  const queue = seeds.map((s) => s.entityId)

  for (const seed of queue) {
    if (visited.has(seed)) continue
    visited.add(seed)
    const edges = active.filter(
      (r) => r.fromEntity === seed || r.toEntity === seed,
    )
    for (const edge of edges.slice(0, 3)) {
      const next =
        edge.fromEntity === seed ? edge.toEntity : edge.fromEntity
      path.push({
        fromId: edge.fromEntity,
        toId: edge.toEntity,
        relationId: edge.id,
        relationType: edge.type,
      })
      if (!visited.has(next)) queue.push(next)
    }
  }

  const passageIds = new Set<string>()
  for (const step of path) {
    const rel = active.find((r) => r.id === step.relationId)
    if (rel) passageIds.add(rel.passageId)
  }
  for (const seed of seeds) {
    const entity = entities.get(seed.entityId)
    if (entity) passageIds.add(entity.passageId)
  }

  const matchedTerms = new Set<string>()
  for (const term of queryTerms) {
    for (const doc of corpus) {
      if (tokenize(doc).includes(term)) {
        matchedTerms.add(term)
        break
      }
    }
  }
  const missingTerms = queryTerms.filter((t) => !matchedTerms.has(t))

  return {
    seeds,
    path,
    passages: [...passageIds]
      .map((id) => passages.get(id))
      .filter((p): p is Passage => Boolean(p)),
    answerable: missingTerms.length === 0 && seeds.length > 0,
    missingTerms,
  }
}