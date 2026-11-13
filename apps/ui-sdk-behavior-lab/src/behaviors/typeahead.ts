export function filterByTypeahead<T extends { label: string }>(
  items: readonly T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...items]
  return items.filter((item) => item.label.toLowerCase().includes(q))
}

export function advanceTypeaheadIndex(
  current: number,
  direction: "next" | "prev",
  length: number,
): number {
  if (length <= 0) return -1
  if (current < 0) return direction === "next" ? 0 : length - 1
  if (direction === "next") {
    return (current + 1) % length
  }
  return current <= 0 ? length - 1 : current - 1
}

export function matchTypeaheadPrefix(
  items: readonly string[],
  prefix: string,
): number {
  if (!prefix) return -1
  const p = prefix.toLowerCase()
  return items.findIndex((label) => label.toLowerCase().startsWith(p))
}
