import type { CdpEvent, ConsoleLine, TranscriptEntry } from "./types"

export function isConsoleApiCalled(event: CdpEvent): boolean {
  return event.method === "Runtime.consoleAPICalled"
}

export function mapConsoleEvent(event: CdpEvent, atMs: number): ConsoleLine | null {
  if (!isConsoleApiCalled(event)) return null
  const params = event.params ?? {}
  const type = String(params.type ?? "log")
  const args = (params.args as { type?: string; value?: unknown; description?: string }[]) ?? []
  const argsPreview = args.map((a) =>
    a.value !== undefined ? String(a.value) : a.description ?? a.type ?? "?"
  )
  const text = argsPreview.join(" ")
  return { atMs, type, text, argsPreview }
}

export function collectConsoleLines(entries: TranscriptEntry[]): ConsoleLine[] {
  const lines: ConsoleLine[] = []
  for (const entry of entries) {
    if (entry.direction !== "event") continue
    const mapped = mapConsoleEvent(entry.payload as CdpEvent, entry.atMs)
    if (mapped) lines.push(mapped)
  }
  return lines
}