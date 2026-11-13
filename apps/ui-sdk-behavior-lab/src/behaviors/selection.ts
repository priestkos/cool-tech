export type SelectItem = { id: string; label: string }

export function selectSingle(
  current: string | null,
  nextId: string,
): string {
  return nextId === current ? current : nextId
}

export function toggleMulti(
  selected: readonly string[],
  id: string,
): string[] {
  if (selected.includes(id)) {
    return selected.filter((x) => x !== id)
  }
  return [...selected, id]
}

export function isSelected(selected: readonly string[], id: string): boolean {
  return selected.includes(id)
}
