import { isFixtureId, type FixtureId } from "./fixtures/types"

const STORAGE_KEY = "s2t-lab-state-v1"

export type PersistedLabState = {
  fixtureId: FixtureId
  overrides: Record<string, string>
  dark: boolean
}

function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function sanitizeOverrides(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object") {
    return {}
  }
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (typeof key === "string" && typeof value === "string" && key.length < 64 && value.length < 128) {
      out[key] = value
    }
  }
  return out
}

export function parsePersistedState(raw: unknown, fallbackFixture: FixtureId): PersistedLabState {
  const base: PersistedLabState = {
    fixtureId: fallbackFixture,
    overrides: {},
    dark: false,
  }
  if (!raw || typeof raw !== "object") {
    return base
  }
  const obj = raw as Record<string, unknown>
  const fixtureId = isFixtureId(obj.fixtureId) ? obj.fixtureId : fallbackFixture
  const overrides = sanitizeOverrides(obj.overrides)
  const dark = obj.dark === true
  return { fixtureId, overrides, dark }
}

export function readLocalLabState(fallbackFixture: FixtureId): PersistedLabState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return parsePersistedState(null, fallbackFixture)
    }
    return parsePersistedState(safeParseJson(raw), fallbackFixture)
  } catch {
    return parsePersistedState(null, fallbackFixture)
  }
}

export function writeLocalLabState(state: PersistedLabState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / private mode */
  }
}

export function encodeHashState(state: PersistedLabState): string {
  const payload = {
    f: state.fixtureId,
    o: state.overrides,
    d: state.dark ? 1 : 0,
  }
  return `#s2t=${encodeURIComponent(JSON.stringify(payload))}`
}

export function parseHashState(hash: string, fallbackFixture: FixtureId): PersistedLabState {
  try {
    const trimmed = hash.startsWith("#") ? hash.slice(1) : hash
    if (!trimmed.startsWith("s2t=")) {
      return parsePersistedState(null, fallbackFixture)
    }
    const encoded = trimmed.slice(4)
    const decoded = decodeURIComponent(encoded)
    const parsed = safeParseJson(decoded)
    if (!parsed || typeof parsed !== "object") {
      return parsePersistedState(null, fallbackFixture)
    }
    const obj = parsed as Record<string, unknown>
    return parsePersistedState(
      {
        fixtureId: obj.f,
        overrides: obj.o,
        dark: obj.d === 1,
      },
      fallbackFixture,
    )
  } catch {
    return parsePersistedState(null, fallbackFixture)
  }
}

export function syncUrlHash(state: PersistedLabState): void {
  try {
    const next = encodeHashState(state)
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next)
    }
  } catch {
    /* ignore */
  }
}
