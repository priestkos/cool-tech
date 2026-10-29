export type RuleSection = {
  title: string
  checklist: string[]
}

export function parseRuleMarkdown(rule: string): RuleSection[] {
  const sections: RuleSection[] = []
  const chunks = rule.split(/^#### /m).slice(1)
  for (const chunk of chunks) {
    const lines = chunk.split("\n")
    const title = (lines[0] ?? "").trim()
    const checklist: string[] = []
    for (const line of lines.slice(1)) {
      const trimmed = line.trim()
      if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]")) {
        checklist.push(trimmed.replace(/^- \[[ x]\]\s*/, ""))
      }
    }
    if (title) sections.push({ title, checklist })
  }
  return sections
}

export type ParsedRuleGroup = {
  group_id: string
  source: string
  pattern: string
  files: string[]
  rule: string
  sections: RuleSection[]
}

export function enrichRuleGroups(
  groups: Array<{
    group_id: string
    source: string
    pattern: string
    files: string[]
    rule: string
  }>,
): ParsedRuleGroup[] {
  return groups.map((g) => ({
    ...g,
    sections: parseRuleMarkdown(g.rule),
  }))
}
