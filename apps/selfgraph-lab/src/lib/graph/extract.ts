import { companyId, personId, relationKey } from "./ids"
import type { InsertResult, LabEntity, LabRelation, Passage } from "./types"

export interface ExtractOptions {
  mode: "deterministic" | "mock-llm"
}

const SENTENCE =
  /[^.!?\n]+(?:[.!?]|$)/g

function passageFromSentence(
  sourceId: string,
  text: string,
  full: string,
): Passage {
  const startOffset = full.indexOf(text)
  return {
    id: `passage:${sourceId}:${startOffset}`,
    sourceId,
    text: text.trim(),
    startOffset,
    endOffset: startOffset + text.length,
  }
}

function upsertEntity(
  map: Map<string, LabEntity>,
  id: string,
  type: string,
  name: string,
  passageId: string,
  eventTime: Date,
): LabEntity {
  const existing = map.get(id)
  if (existing) return existing
  const entity: LabEntity = { id, type, name, passageId, eventTime }
  map.set(id, entity)
  return entity
}

export function extractFromText(
  fullText: string,
  sourceId: string,
  eventTime: Date,
  options: ExtractOptions,
): InsertResult {
  const passages: Passage[] = []
  const entityMap = new Map<string, LabEntity>()
  const relations: LabRelation[] = []
  let revision = 0

  const sentences = fullText.match(SENTENCE) ?? [fullText]
  for (const raw of sentences) {
    const sentence = raw.trim()
    if (!sentence) continue
    const passage = passageFromSentence(sourceId, sentence, fullText)
    passages.push(passage)

    const joined = sentence.match(
      /^([A-Z][a-z]+ [A-Z][a-z]+) joined (.+?) as\b/i,
    )
    if (joined) {
      const person = upsertEntity(
        entityMap,
        personId(joined[1]),
        "Person",
        joined[1],
        passage.id,
        eventTime,
      )
      const companyName = joined[2].replace(/\s+as.*$/i, "").trim()
      const company = upsertEntity(
        entityMap,
        companyId(companyName),
        "Company",
        companyName,
        passage.id,
        eventTime,
      )
      revision += 1
      relations.push({
        id: `${relationKey(person.id, "WORKS_AT", company.id)}:${revision}`,
        fromEntity: person.id,
        type: "WORKS_AT",
        toEntity: company.id,
        passageId: passage.id,
        eventTime,
        createdAt: eventTime,
        isCurrent: true,
        invalidatedAt: null,
        revision,
      })
      continue
    }

    const leftStarted = sentence.match(
      /^([A-Z][a-z]+ [A-Z][a-z]+) left (.+?) and started at (.+?)(?:\s+as\b|[.!?])/i,
    )
    if (leftStarted) {
      const person = upsertEntity(
        entityMap,
        personId(leftStarted[1]),
        "Person",
        leftStarted[1],
        passage.id,
        eventTime,
      )
      const oldCo = companyId(leftStarted[2].trim())
      const newCoName = leftStarted[3].trim()
      const newCo = upsertEntity(
        entityMap,
        companyId(newCoName),
        "Company",
        newCoName,
        passage.id,
        eventTime,
      )
      for (const rel of relations) {
        if (
          rel.fromEntity === person.id &&
          rel.type === "WORKS_AT" &&
          rel.isCurrent
        ) {
          rel.isCurrent = false
          rel.invalidatedAt = eventTime
        }
      }
      revision += 1
      relations.push({
        id: `${relationKey(person.id, "WORKS_AT", newCo.id)}:${revision}`,
        fromEntity: person.id,
        type: "WORKS_AT",
        toEntity: newCo.id,
        passageId: passage.id,
        eventTime,
        createdAt: eventTime,
        isCurrent: true,
        invalidatedAt: null,
        revision,
      })
      void oldCo
      continue
    }

    const reports = sentence.match(
      /^([A-Z][a-z]+ [A-Z][a-z]+) reports to ([A-Z][a-z]+ [A-Z][a-z]+)\b/i,
    )
    if (reports) {
      const person = upsertEntity(
        entityMap,
        personId(reports[1]),
        "Person",
        reports[1],
        passage.id,
        eventTime,
      )
      const manager = upsertEntity(
        entityMap,
        personId(reports[2]),
        "Person",
        reports[2],
        passage.id,
        eventTime,
      )
      revision += 1
      relations.push({
        id: `${relationKey(person.id, "REPORTS_TO", manager.id)}:${revision}`,
        fromEntity: person.id,
        type: "REPORTS_TO",
        toEntity: manager.id,
        passageId: passage.id,
        eventTime,
        createdAt: eventTime,
        isCurrent: true,
        invalidatedAt: null,
        revision,
      })
    }
  }

  if (options.mode === "mock-llm") {
    const capitalized = fullText.match(/\b[A-Z][a-z]{2,}\b/g) ?? []
    for (const word of capitalized.slice(0, 3)) {
      const id = `thing:${word.toLowerCase()}`
      if (!entityMap.has(id)) {
        entityMap.set(id, {
          id,
          type: "Thing",
          name: word,
          passageId: passages[0]?.id ?? `passage:${sourceId}:0`,
          eventTime,
        })
      }
    }
  }

  return {
    entities: [...entityMap.values()],
    relations,
    passages,
  }
}