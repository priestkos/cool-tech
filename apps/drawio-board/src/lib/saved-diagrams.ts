export type SavedDiagram = {
  id: string
  name: string
  xml: string
  updatedAt: number
}

export const STORAGE_KEY = "diagram-desk-saves"

export function loadSavedDiagrams(): SavedDiagram[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedDiagram[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.xml === "string" &&
        typeof item.updatedAt === "number",
    )
  } catch {
    return []
  }
}

export function persistSavedDiagrams(diagrams: SavedDiagram[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(diagrams))
}

export function createSavedDiagram(name: string, xml: string): SavedDiagram {
  const trimmed = name.trim() || "Untitled diagram"
  return {
    id: crypto.randomUUID(),
    name: trimmed,
    xml,
    updatedAt: Date.now(),
  }
}

export function renameSavedDiagram(
  diagrams: SavedDiagram[],
  id: string,
  name: string,
): SavedDiagram[] {
  const trimmed = name.trim()
  if (!trimmed) return diagrams
  return diagrams.map((d) =>
    d.id === id ? { ...d, name: trimmed, updatedAt: Date.now() } : d,
  )
}

export function deleteSavedDiagram(
  diagrams: SavedDiagram[],
  id: string,
): SavedDiagram[] {
  return diagrams.filter((d) => d.id !== id)
}

export function upsertSavedDiagram(
  diagrams: SavedDiagram[],
  entry: SavedDiagram,
): SavedDiagram[] {
  const existing = diagrams.some((d) => d.id === entry.id)
  if (existing) {
    return diagrams.map((d) => (d.id === entry.id ? entry : d))
  }
  return [entry, ...diagrams]
}
