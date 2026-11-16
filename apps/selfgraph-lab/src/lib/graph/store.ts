import { extractFromText, type ExtractOptions } from "./extract"
import { retrieveFromGraph } from "./retrieve"
import type {
  LabEntity,
  LabGraphSnapshot,
  LabRelation,
  Passage,
  RetrievalResult,
} from "./types"

export class LabGraphStore {
  passages = new Map<string, Passage>()
  entities = new Map<string, LabEntity>()
  relations: LabRelation[] = []
  sourceText = ""

  clear(): void {
    this.passages.clear()
    this.entities.clear()
    this.relations = []
    this.sourceText = ""
  }

  ingestDocument(
    text: string,
    sourceId: string,
    eventTime: Date,
    options: ExtractOptions,
  ): void {
    this.sourceText = this.sourceText ? `${this.sourceText}\n\n${text}` : text
    const result = extractFromText(text, sourceId, eventTime, options)
    for (const p of result.passages) this.passages.set(p.id, p)
    for (const e of result.entities) this.entities.set(e.id, e)
    for (const rel of result.relations) {
      if (rel.type === "WORKS_AT" && rel.isCurrent) {
        for (const existing of this.relations) {
          if (
            existing.fromEntity === rel.fromEntity &&
            existing.type === "WORKS_AT" &&
            existing.isCurrent
          ) {
            existing.isCurrent = false
            existing.invalidatedAt = rel.eventTime
          }
        }
      }
      this.relations.push(rel)
    }
  }

  relationsAsOf(asOf: Date): LabRelation[] {
    return this.relations.filter((rel) => {
      if (rel.createdAt > asOf) return false
      if (rel.invalidatedAt && rel.invalidatedAt <= asOf) return false
      return true
    })
  }

  currentRelations(): LabRelation[] {
    return this.relations.filter((r) => r.isCurrent)
  }

  employerForPersonAt(personId: string, asOf: Date): string | null {
    const rel = this.relationsAsOf(asOf).find(
      (r) => r.fromEntity === personId && r.type === "WORKS_AT",
    )
    return rel?.toEntity ?? null
  }

  passageForRelation(relationId: string): Passage | undefined {
    const rel = this.relations.find((r) => r.id === relationId)
    if (!rel) return undefined
    return this.passages.get(rel.passageId)
  }

  retrieve(query: string, asOf: Date): RetrievalResult {
    return retrieveFromGraph(query, asOf, this.entities, this.relations, this.passages)
  }

  toSnapshot(): LabGraphSnapshot {
    return {
      version: 1,
      passages: [...this.passages.values()],
      entities: [...this.entities.values()],
      relations: this.relations,
      sourceText: this.sourceText,
    }
  }

  static fromSnapshot(snapshot: LabGraphSnapshot): LabGraphStore {
    const store = new LabGraphStore()
    store.sourceText = snapshot.sourceText
    for (const p of snapshot.passages) store.passages.set(p.id, p)
    for (const e of snapshot.entities) store.entities.set(e.id, e)
    store.relations = snapshot.relations.map((r) => ({
      ...r,
      eventTime: new Date(r.eventTime),
      createdAt: new Date(r.createdAt),
      invalidatedAt: r.invalidatedAt ? new Date(r.invalidatedAt) : null,
    }))
    return store
  }
}