import { getFixtureById } from "./fixtures/catalog"
import { isFixtureId, type FixtureId, type FixturePack } from "./fixtures/types"

export function loadFixture(id: unknown): FixturePack | null {
  if (!isFixtureId(id)) {
    return null
  }
  return getFixtureById(id) ?? null
}

export function defaultFixtureId(): FixtureId {
  return "nimbus-analytics"
}

export function cloneFixtureTokens(fixture: FixturePack): FixturePack {
  return {
    ...fixture,
    primitives: fixture.primitives.map((t) => ({ ...t })),
    semantic: fixture.semantic.map((t) => ({ ...t })),
    component: fixture.component.map((t) => ({ ...t })),
  }
}
