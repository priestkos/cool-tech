import type { PresetId } from "@/lib/soundcn/presets"

const KNOWN_PRESET_IDS: PresetId[] = [
  "click-soft",
  "switch-on",
  "switch-off",
  "notification-pop",
  "confirmation-001",
]

export const LOG_MAX = 40

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function canEmitSound(unlocked: boolean, muted: boolean): boolean {
  return unlocked && !muted
}

export type LogEntry = {
  id: string
  at: string
  message: string
}

export function appendLog(
  entries: LogEntry[],
  message: string,
  createId: () => string = () => crypto.randomUUID(),
  max = LOG_MAX,
): LogEntry[] {
  const next: LogEntry[] = [
    ...entries,
    { id: createId(), at: new Date().toISOString(), message },
  ]
  return next.slice(-max)
}

export function isPresetId(id: string): id is PresetId {
  return (KNOWN_PRESET_IDS as string[]).includes(id)
}

export function formatPresetLabel(id: PresetId): string {
  return id.replace(/-/g, " ")
}
