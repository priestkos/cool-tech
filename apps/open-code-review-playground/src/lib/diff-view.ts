import { parsePatch } from "diff"
import type { ReviewComment } from "@/lib/api-types.ts"

type ParsedDiff = NonNullable<ReturnType<typeof parsePatch>>[number]

export type DiffDisplayLine = {
  newLine: number | null
  oldLine: number | null
  prefix: " " | "+" | "-"
  text: string
}

export type FileDiffView = {
  path: string
  lines: DiffDisplayLine[]
}

export function buildFileDiffViews(unifiedDiff: string): FileDiffView[] {
  const patches = parsePatch(unifiedDiff) ?? []
  return patches.map((patch) => ({
    path:
      patch.newFileName?.replace(/^b\//, "") ??
      patch.oldFileName?.replace(/^a\//, "") ??
      "unknown",
    lines: expandPatchLines(patch),
  }))
}

function expandPatchLines(patch: ParsedDiff): DiffDisplayLine[] {
  const lines: DiffDisplayLine[] = []
  for (const hunk of patch.hunks ?? []) {
    let oldLine = hunk.oldStart
    let newLine = hunk.newStart
    for (const raw of hunk.lines) {
      const prefix = raw[0] as " " | "+" | "-"
      const text = raw.slice(1)
      if (prefix === " ") {
        lines.push({ oldLine, newLine, prefix, text })
        oldLine += 1
        newLine += 1
      } else if (prefix === "-") {
        lines.push({ oldLine, newLine: null, prefix, text })
        oldLine += 1
      } else {
        lines.push({ oldLine: null, newLine, prefix, text })
        newLine += 1
      }
    }
  }
  return lines
}

export type SeverityKey = "critical" | "high" | "medium" | "low" | "unrated"

export function severityKey(comment: ReviewComment): SeverityKey {
  const s = comment.severity?.toLowerCase()
  if (s === "critical" || s === "high" || s === "medium" || s === "low") return s
  return "unrated"
}

export function commentsForNewLine(
  comments: ReviewComment[],
  path: string,
  newLine: number,
): ReviewComment[] {
  return comments.filter(
    (c) => c.path === path && newLine >= c.start_line && newLine <= c.end_line,
  )
}

export const SEVERITY_ORDER: SeverityKey[] = [
  "critical",
  "high",
  "medium",
  "low",
  "unrated",
]

export function categorySectionHint(category?: string): string | undefined {
  switch (category) {
    case "security":
      return "Security-Sensitive Code"
    case "bug":
      return "Boundary and Edge-Case Handling"
    case "performance":
      return "Performance"
    case "maintainability":
      return "Dead Code"
    case "style":
      return "Obvious Typos or Spelling Errors"
    case "documentation":
      return "Obvious Typos or Spelling Errors"
    case "test":
      return "Boundary and Edge-Case Handling"
    case "other":
      return undefined
    default:
      return undefined
  }
}
