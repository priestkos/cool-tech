export function parseBunVersion(version: string): [number, number, number] {
  const core = version.split("-")[0] ?? version
  const parts = core.split(".").map((p) => parseInt(p, 10))
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
}

export function bunVersionAtLeast(current: string, minimum: string): boolean {
  const [a, b, c] = parseBunVersion(current)
  const [ma, mb, mc] = parseBunVersion(minimum)
  if (a !== ma) return a > ma
  if (b !== mb) return b > mb
  return c >= mc
}
