import type { FixturePack, ResolvedTokens, TokenRecord } from "./fixtures/types"

const REF_PATTERN = /^\{([^}]+)\}$/

function allRecords(fixture: FixturePack): TokenRecord[] {
  return [...fixture.primitives, ...fixture.semantic, ...fixture.component]
}

export function resolveReference(raw: string, byId: Map<string, string>): string {
  const match = REF_PATTERN.exec(raw.trim())
  if (!match) {
    return raw
  }
  const target = match[1]
  return byId.get(target) ?? raw
}

export function resolveTokens(
  fixture: FixturePack,
  overrides: Record<string, string> = {},
): ResolvedTokens {
  const byId = new Map<string, string>()

  const setValue = (id: string, value: string) => {
    byId.set(id, value)
  }

  for (const tier of ["primitive", "semantic", "component"] as const) {
    const list =
      tier === "primitive"
        ? fixture.primitives
        : tier === "semantic"
          ? fixture.semantic
          : fixture.component

    for (const record of list) {
      const override = overrides[record.id]
      const base = override ?? record.value
      let resolved = base
      let guard = 0
      while (REF_PATTERN.test(resolved.trim()) && guard < 12) {
        resolved = resolveReference(resolved, byId)
        guard += 1
      }
      setValue(record.id, resolved)
    }
  }

  const cssVariables: Record<string, string> = {}
  for (const [cssVar, tokenId] of Object.entries(fixture.previewBindings)) {
    const value = byId.get(tokenId)
    if (value) {
      cssVariables[cssVar] = value
    }
  }

  return { byId, cssVariables }
}

export function applyPrimitiveEdit(
  fixture: FixturePack,
  tokenId: string,
  nextValue: string,
): FixturePack {
  return {
    ...fixture,
    primitives: fixture.primitives.map((t) =>
      t.id === tokenId ? { ...t, value: nextValue } : t,
    ),
  }
}

export function applyTokenMetaEdit(
  fixture: FixturePack,
  tokenId: string,
  patch: Partial<Pick<TokenRecord, "name" | "accepted" | "merged">>,
): FixturePack {
  const mapTier = (list: TokenRecord[]) =>
    list.map((t) => (t.id === tokenId ? { ...t, ...patch } : t))
  return {
    ...fixture,
    primitives: mapTier(fixture.primitives),
    semantic: mapTier(fixture.semantic),
    component: mapTier(fixture.component),
  }
}

export function resolvedWithDarkMode(
  fixture: FixturePack,
  resolved: ResolvedTokens,
  dark: boolean,
): ResolvedTokens {
  if (!dark) {
    return resolved
  }
  const byId = new Map(resolved.byId)
  for (const [tokenId, value] of Object.entries(fixture.darkOverrides)) {
    byId.set(tokenId, value)
  }
  const cssVariables = { ...resolved.cssVariables }
  for (const [cssVar, tokenId] of Object.entries(fixture.previewBindings)) {
    const darkVal = fixture.darkOverrides[tokenId]
    if (darkVal) {
      cssVariables[cssVar] = darkVal
    } else {
      const v = byId.get(tokenId)
      if (v) {
        cssVariables[cssVar] = v
      }
    }
  }
  return { byId, cssVariables }
}

export function findRecord(fixture: FixturePack, id: string): TokenRecord | undefined {
  return allRecords(fixture).find((r) => r.id === id)
}
