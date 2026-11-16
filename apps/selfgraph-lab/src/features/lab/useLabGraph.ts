import { useCallback, useMemo, useState } from "react"
import { SAMPLE_NOTES, SAMPLE_SECTIONS } from "@/data/sample-notes"
import { LabGraphStore } from "@/lib/graph/store"
import type { LabEntity, LabRelation, Passage, RetrievalResult } from "@/lib/graph/types"

export type SelectedFact =
  | { kind: "entity"; entity: LabEntity; passage: Passage | undefined }
  | { kind: "relation"; relation: LabRelation; passage: Passage | undefined }

export function useLabGraph() {
  const [store, setStore] = useState(() => new LabGraphStore())
  const [mockLlm, setMockLlm] = useState(false)
  const [asOf, setAsOf] = useState(() => new Date("2026-07-01T00:00:00Z"))
  const [sourceText, setSourceText] = useState(SAMPLE_NOTES)
  const [selected, setSelected] = useState<SelectedFact | null>(null)
  const [question, setQuestion] = useState("Where does Ann Chen work?")
  const [retrieval, setRetrieval] = useState<RetrievalResult | null>(null)
  const [highlightPath, setHighlightPath] = useState<string[]>([])

  const mode = mockLlm ? "mock-llm" : "deterministic"

  const runExtraction = useCallback(
    (text: string, fromSamples = false) => {
      const next = new LabGraphStore()
      if (fromSamples) {
        for (const section of SAMPLE_SECTIONS) {
          next.ingestDocument(section.text, section.id, section.eventTime, {
            mode,
          })
        }
      } else {
        next.ingestDocument(text, "pasted", new Date(), { mode })
      }
      setStore(next)
      setSelected(null)
      setRetrieval(null)
      setHighlightPath([])
    },
    [mode],
  )

  const entities = useMemo(() => [...store.entities.values()], [store])
  const relations = useMemo(
    () => store.relationsAsOf(asOf),
    [store, asOf],
  )
  const retiredRelations = useMemo(
    () => store.relations.filter((r) => !r.isCurrent),
    [store],
  )

  const timelineBounds = useMemo(() => {
    const times = store.relations.map((r) => r.eventTime.getTime())
    const min = Math.min(...times, Date.parse("2026-03-15T00:00:00Z"))
    const max = Math.max(...times, Date.parse("2026-07-01T00:00:00Z"))
    return { min, max }
  }, [store])

  const ask = useCallback(() => {
    const result = store.retrieve(question, asOf)
    setRetrieval(result)
    setHighlightPath(result.path.map((p) => p.relationId))
  }, [store, question, asOf])

  const selectEntity = useCallback(
    (entity: LabEntity) => {
      setSelected({
        kind: "entity",
        entity,
        passage: store.passages.get(entity.passageId),
      })
    },
    [store],
  )

  const selectRelation = useCallback(
    (relation: LabRelation) => {
      setSelected({
        kind: "relation",
        relation,
        passage: store.passages.get(relation.passageId),
      })
    },
    [store],
  )

  return {
    store,
    mockLlm,
    setMockLlm,
    asOf,
    setAsOf,
    sourceText,
    setSourceText,
    selected,
    entities,
    relations,
    retiredRelations,
    timelineBounds,
    question,
    setQuestion,
    retrieval,
    highlightPath,
    runExtraction,
    ask,
    selectEntity,
    selectRelation,
  }
}