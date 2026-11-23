export type InboxItem = { id: string; title: string; preview: string }

export const INITIAL_INBOX: InboxItem[] = [
  { id: "a", title: "Rayan · dissolve-ui", preview: "Web components shipped — try the scratch card." },
  { id: "b", title: "Lab note", preview: "Real engine snapshots views into canvas grains." },
  { id: "c", title: "Reminder", preview: "Swipe this row left to watch the list close up." },
]

export function removeInboxItem(items: InboxItem[], id: string): InboxItem[] {
  return items.filter((i) => i.id !== id)
}

export function restoreInboxItem(items: InboxItem[], item: InboxItem): InboxItem[] {
  if (items.some((i) => i.id === item.id)) return items
  return [item, ...items]
}