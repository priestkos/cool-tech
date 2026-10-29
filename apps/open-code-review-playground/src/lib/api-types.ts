export type OcrPreview = {
  files: Array<{
    path: string
    status: string
    insertions: number
    deletions: number
    will_review: boolean
  }>
  total_insertions: number
  total_deletions: number
  total_files: number
  reviewable_count: number
  excluded_count: number
}

export type ParsedRuleGroup = {
  group_id: string
  source: string
  pattern: string
  files: string[]
  rule: string
  sections: Array<{ title: string; checklist: string[] }>
}

export type AnalyzeResponse = {
  unifiedDiff: string
  preview: OcrPreview
  ruleGroups: ParsedRuleGroup[]
  sampleId?: string
  pastedDiff?: boolean
}

export type ReviewComment = {
  path: string
  content: string
  start_line: number
  end_line: number
  existing_code?: string
  suggestion_code?: string
  thinking?: string
  category?: string
  severity?: string
}

export type ReviewResponse = {
  status: string
  llm?: { provider?: string; model?: string }
  message?: string
  summary?: {
    files_reviewed: number
    comments: number
    total_tokens: number
    input_tokens: number
    output_tokens: number
    cache_read_tokens?: number
    cache_write_tokens?: number
    elapsed: string
  }
  comments: ReviewComment[]
  warnings?: string[]
  session_id?: string
  mock?: boolean
  fixtureNote?: string
}
