export type ToastStatus = "hidden" | "loading" | "success" | "error" | "progress"

export type ToastActionKind = "undo" | "dismiss" | "none"

export type ToastSnapshot = {
  generation: number
  status: ToastStatus
  title: string
  description?: string
  /** 0–100 when status is progress; otherwise null */
  progress: number | null
  actionLabel: string | null
  actionKind: ToastActionKind
  /** Suppress duplicate error announcements in live region */
  errorAnnounced: boolean
}

export const HIDDEN_TOAST: ToastSnapshot = {
  generation: 0,
  status: "hidden",
  title: "",
  description: undefined,
  progress: null,
  actionLabel: null,
  actionKind: "none",
  errorAnnounced: false,
}

export function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

export function bumpGeneration(current: number): number {
  return current + 1
}

/** Stale async completions must not overwrite a newer generation or non-loading toast. */
export function shouldApplyAsyncResult(
  targetGeneration: number,
  liveGeneration: number,
  liveStatus: ToastStatus,
): boolean {
  return targetGeneration === liveGeneration && liveStatus === "loading"
}

export type MorphInput = {
  status: ToastStatus
  title: string
  description?: string
  progress?: number | null
  actionLabel?: string | null
  actionKind?: ToastActionKind
}

export function morphToast(
  prev: ToastSnapshot,
  next: MorphInput,
  options?: { incrementGeneration?: boolean },
): ToastSnapshot {
  const increment = options?.incrementGeneration ?? false
  const generation = increment ? bumpGeneration(prev.generation) : prev.generation
  const progress =
    next.status === "progress"
      ? clampProgress(next.progress ?? prev.progress ?? 0)
      : next.progress === undefined
        ? null
        : next.progress

  const isError = next.status === "error"
  const errorAnnounced = isError
    ? prev.status === "error" && prev.title === next.title
      ? prev.errorAnnounced
      : false
    : false

  return {
    generation,
    status: next.status,
    title: next.title,
    description: next.description,
    progress,
    actionLabel: next.actionLabel ?? null,
    actionKind: next.actionKind ?? "none",
    errorAnnounced,
  }
}

export function markErrorAnnounced(snapshot: ToastSnapshot): ToastSnapshot {
  if (snapshot.status !== "error") return snapshot
  return { ...snapshot, errorAnnounced: true }
}

export function dismissToast(prev: ToastSnapshot): ToastSnapshot {
  return {
    ...HIDDEN_TOAST,
    generation: bumpGeneration(prev.generation),
  }
}

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
