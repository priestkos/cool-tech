export function formatReorderAnnouncement(
  itemLabel: string,
  fromIndex: number,
  toIndex: number,
): string {
  const position = toIndex + 1
  return `${itemLabel} moved to position ${position} (from ${fromIndex + 1}).`
}

export function formatSelectionAnnouncement(label: string, selected: boolean): string {
  return selected ? `${label} selected.` : `${label} deselected.`
}
