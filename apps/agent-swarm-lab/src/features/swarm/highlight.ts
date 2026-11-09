const HIDDEN_NAME = "swarm-hidden"

export function supportsCustomHighlight(): boolean {
  return (
    typeof CSS !== "undefined" &&
    "highlights" in CSS &&
    typeof Highlight !== "undefined"
  )
}

export type TextSegment = {
  node: Text
  startInNode: number
  endInNode: number
  globalStart: number
  globalEnd: number
}

export function collectTypableSegments(root: HTMLElement): TextSegment[] {
  const segments: TextSegment[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let global = 0
  let node = walker.nextNode()
  while (node) {
    const text = node as Text
    const value = text.textContent ?? ""
    if (value.length > 0) {
      segments.push({
        node: text,
        startInNode: 0,
        endInNode: value.length,
        globalStart: global,
        globalEnd: global + value.length,
      })
      global += value.length
    }
    node = walker.nextNode()
  }
  return segments
}

export function totalTypableChars(segments: TextSegment[]): number {
  return segments.reduce((acc, s) => acc + (s.globalEnd - s.globalStart), 0)
}

export function buildHiddenRanges(
  segments: TextSegment[],
  revealThroughIndex: number,
): Range[] {
  if (!supportsCustomHighlight()) return []
  const ranges: Range[] = []
  let cursor = 0
  for (const segment of segments) {
    const len = segment.globalEnd - segment.globalStart
    const segmentStart = cursor
    const segmentEnd = cursor + len
    if (revealThroughIndex <= segmentStart) {
      const range = document.createRange()
      range.setStart(segment.node, segment.startInNode)
      range.setEnd(segment.node, segment.endInNode)
      ranges.push(range)
    } else if (revealThroughIndex < segmentEnd) {
      const offsetInNode =
        segment.startInNode + (revealThroughIndex - segmentStart)
      const range = document.createRange()
      range.setStart(segment.node, offsetInNode)
      range.setEnd(segment.node, segment.endInNode)
      ranges.push(range)
    }
    cursor = segmentEnd
  }
  return ranges
}

export function applyHiddenHighlight(
  segments: TextSegment[],
  revealThroughIndex: number,
): void {
  if (!supportsCustomHighlight()) return
  const ranges = buildHiddenRanges(segments, revealThroughIndex)
  if (ranges.length === 0) {
    CSS.highlights.delete(HIDDEN_NAME)
    return
  }
  CSS.highlights.set(HIDDEN_NAME, new Highlight(...ranges))
}

export function clearHiddenHighlight(): void {
  if (!supportsCustomHighlight()) return
  CSS.highlights.delete(HIDDEN_NAME)
}
