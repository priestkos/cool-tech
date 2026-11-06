import { describe, expect, test } from "bun:test"
import { getFixtureById } from "./fixtures/catalog"
import { applyPrimitiveEdit, resolveTokens } from "./token-cascade"

describe("token cascade", () => {
  test("editing primitive cascades to semantic and component", () => {
    const base = getFixtureById("nimbus-analytics")
    if (!base) {
      throw new Error("missing fixture")
    }
    const edited = applyPrimitiveEdit(base, "blue-600", "#0000ff")
    const resolved = resolveTokens(edited)
    expect(resolved.byId.get("blue-600")).toBe("#0000ff")
    expect(resolved.byId.get("color-accent")).toBe("#0000ff")
    expect(resolved.byId.get("button-primary-bg")).toBe("#0000ff")
  })

  test("override wins over fixture value", () => {
    const base = getFixtureById("nimbus-analytics")
    if (!base) {
      throw new Error("missing fixture")
    }
    const resolved = resolveTokens(base, { "slate-900": "#222222" })
    expect(resolved.byId.get("color-text-primary")).toBe("#222222")
  })
})
