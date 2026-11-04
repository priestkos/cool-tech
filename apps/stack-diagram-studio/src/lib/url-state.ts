import type { DiagramTheme, PositionMap } from "./types"

export interface AppStatePayload {
  sentence: string
  theme: DiagramTheme
  diagramTheme: DiagramTheme
  positions: PositionMap
}

export function encodeAppState(state: AppStatePayload): string {
  const payload = {
    s: state.sentence,
    t: state.theme,
    d: state.diagramTheme,
    p: state.positions,
  }
  return `#${encodeURIComponent(JSON.stringify(payload))}`
}

export function decodeAppState(hash: string): AppStatePayload | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<AppStatePayload> & {
      s?: string
      t?: string
      d?: string
      p?: PositionMap
    }
    const theme = parsed.t === "dark" ? "dark" : "light"
    const diagramTheme = parsed.d === "dark" ? "dark" : theme
    const sentence = typeof parsed.s === "string" ? parsed.s : ""
    const positions =
      parsed.p && typeof parsed.p === "object" && !Array.isArray(parsed.p) ? parsed.p : {}
    const safePositions: PositionMap = {}
    for (const [key, val] of Object.entries(positions)) {
      if (val && typeof val === "object" && "x" in val && "y" in val) {
        const x = Number((val as { x: unknown }).x)
        const y = Number((val as { y: unknown }).y)
        if (Number.isFinite(x) && Number.isFinite(y)) {
          safePositions[key] = { x, y }
        }
      }
    }
    return { sentence, theme, diagramTheme, positions: safePositions }
  } catch {
    return null
  }
}
