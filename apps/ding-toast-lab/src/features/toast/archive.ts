export type SampleItem = { id: string; label: string; archived: boolean }

export const INITIAL_ITEMS: SampleItem[] = [
  { id: "a", label: "Quarterly report.pdf", archived: false },
  { id: "b", label: "Design tokens v2", archived: false },
  { id: "c", label: "Release checklist", archived: false },
]

export function archiveItem(items: SampleItem[], id: string): SampleItem[] {
  return items.map((item) => (item.id === id ? { ...item, archived: true } : item))
}

export function restoreItem(items: SampleItem[], id: string): SampleItem[] {
  return items.map((item) => (item.id === id ? { ...item, archived: false } : item))
}