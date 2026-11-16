export interface Passage {
  id: string
  sourceId: string
  text: string
  startOffset: number
  endOffset: number
}

export interface LabEntity {
  id: string
  type: string
  name: string
  passageId: string
  eventTime: Date
}

export interface LabRelation {
  id: string
  fromEntity: string
  type: string
  toEntity: string
  passageId: string
  eventTime: Date
  createdAt: Date
  isCurrent: boolean
  invalidatedAt: Date | null
  revision: number
}

export interface InsertResult {
  entities: LabEntity[]
  relations: LabRelation[]
  passages: Passage[]
}

export interface RetrievalSeed {
  entityId: string
  score: number
  label: string
}

export interface TraversalStep {
  fromId: string
  toId: string
  relationId: string
  relationType: string
}

export interface RetrievalResult {
  seeds: RetrievalSeed[]
  path: TraversalStep[]
  passages: Passage[]
  answerable: boolean
  missingTerms: string[]
}

export interface LabGraphSnapshot {
  version: 1
  passages: Passage[]
  entities: LabEntity[]
  relations: LabRelation[]
  sourceText: string
}