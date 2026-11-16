const STOP = new Set([
  "a",
  "an",
  "the",
  "at",
  "in",
  "on",
  "for",
  "to",
  "of",
  "and",
  "or",
  "is",
  "who",
  "where",
  "does",
  "do",
  "what",
  "which",
])

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

export function bm25Score(
  queryTerms: string[],
  document: string,
  avgLen: number,
  docFreq: Map<string, number>,
  totalDocs: number,
): number {
  const docTerms = tokenize(document)
  if (docTerms.length === 0) return 0
  const tf = new Map<string, number>()
  for (const term of docTerms) {
    tf.set(term, (tf.get(term) ?? 0) + 1)
  }
  const k1 = 1.2
  const b = 0.75
  const len = docTerms.length
  let score = 0
  for (const term of queryTerms) {
    const freq = tf.get(term) ?? 0
    if (freq === 0) continue
    const df = docFreq.get(term) ?? 0.5
    const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5))
    const norm =
      (freq * (k1 + 1)) / (freq + k1 * (1 - b + (b * len) / avgLen))
    score += idf * norm
  }
  return score
}

export function buildDocFreq(documents: string[]): Map<string, number> {
  const df = new Map<string, number>()
  for (const doc of documents) {
    const seen = new Set(tokenize(doc))
    for (const term of seen) {
      df.set(term, (df.get(term) ?? 0) + 1)
    }
  }
  return df
}