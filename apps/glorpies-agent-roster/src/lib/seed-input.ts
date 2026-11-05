export type SeedMode = "string" | "number"

export type ParsedSeed = {
  name: string | number
  display: string
}

export function parseSeedInput(raw: string, mode: SeedMode): ParsedSeed {
  const trimmed = raw.trim()
  if (mode === "number") {
    if (trimmed === "") {
      return { name: 0, display: "0" }
    }
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed)) {
      return { name: 0, display: "0" }
    }
    return { name: parsed, display: String(parsed) }
  }
  if (trimmed === "") {
    return { name: "unnamed-glorp", display: "unnamed-glorp" }
  }
  return { name: trimmed, display: trimmed }
}

export function toggleSeedMode(mode: SeedMode): SeedMode {
  return mode === "string" ? "number" : "string"
}
