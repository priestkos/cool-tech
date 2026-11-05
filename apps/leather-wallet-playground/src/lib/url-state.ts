import {
  clampConfig,
  DEFAULT_CONFIG,
  type PlaygroundConfig,
} from "./config"

const PARAM = "w"

type CompactCard = [string, string, string, string]
type CompactPayload = {
  l: string
  w: number
  c: CompactCard[]
}

function toCompact(config: PlaygroundConfig): CompactPayload {
  return {
    l: config.pocketLabel,
    w: config.widthPx,
    c: config.cards.map(
      (card) =>
        [card.title, card.description, card.content, card.colorClass] as CompactCard,
    ),
  }
}

function fromCompact(payload: unknown): Partial<PlaygroundConfig> {
  if (!payload || typeof payload !== "object") return {}
  const p = payload as CompactPayload
  if (!Array.isArray(p.c)) return {}
  return {
    pocketLabel: typeof p.l === "string" ? p.l : undefined,
    widthPx: typeof p.w === "number" ? p.w : undefined,
    cards: p.c.map((row) => {
      if (!Array.isArray(row) || row.length < 4) return undefined
      return {
        title: String(row[0]),
        description: String(row[1]),
        content: String(row[2]),
        colorClass: String(row[3]),
      }
    }).filter((c): c is NonNullable<typeof c> => Boolean(c)),
  }
}

function encodeBase64Url(json: string) {
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function decodeBase64Url(token: string) {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/")
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function configFromSearch(search: string): PlaygroundConfig {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`)
  const token = params.get(PARAM)
  if (!token) return clampConfig(DEFAULT_CONFIG)
  try {
    const json = decodeBase64Url(token)
    const parsed = JSON.parse(json) as unknown
    return clampConfig(fromCompact(parsed))
  } catch {
    return clampConfig(DEFAULT_CONFIG)
  }
}

export function searchFromConfig(config: PlaygroundConfig): string {
  const compact = toCompact(clampConfig(config))
  const token = encodeBase64Url(JSON.stringify(compact))
  const params = new URLSearchParams()
  params.set(PARAM, token)
  return `?${params.toString()}`
}

export function configsEqual(a: PlaygroundConfig, b: PlaygroundConfig) {
  return searchFromConfig(a) === searchFromConfig(b)
}

/** @internal for tests */
export function parseRawPayload(json: string) {
  return clampConfig(fromCompact(JSON.parse(json)))
}

export function serializeRawPayload(config: PlaygroundConfig) {
  return JSON.stringify(toCompact(clampConfig(config)))
}
