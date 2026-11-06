export type TokenTier = "primitive" | "semantic" | "component"

export type TokenRecord = {
  id: string
  name: string
  tier: TokenTier
  /** Raw stored value: hex, dimension, or `{tokenId}` reference */
  value: string
  reason: string
  accepted: boolean
  merged: boolean
}

export type RewriteExample = {
  before: string
  after: string
}

export type FixturePack = {
  id: string
  title: string
  blurb: string
  screenshotPath: string
  primitives: TokenRecord[]
  semantic: TokenRecord[]
  component: TokenRecord[]
  /** CSS custom property names mapped to token ids for preview */
  previewBindings: Record<string, string>
  darkOverrides: Record<string, string>
  rewriteExamples: RewriteExample[]
}

export type ResolvedTokens = {
  byId: Map<string, string>
  cssVariables: Record<string, string>
}

export const FIXTURE_IDS = ["nimbus-analytics", "orbit-commerce", "lumen-ops"] as const
export type FixtureId = (typeof FIXTURE_IDS)[number]

export function isFixtureId(value: unknown): value is FixtureId {
  return typeof value === "string" && (FIXTURE_IDS as readonly string[]).includes(value)
}
