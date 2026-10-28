import { describe, expect, test } from "bun:test"
import { buildFmtFlags } from "../lib/flags.ts"

describe("buildFmtFlags allowlist", () => {
  test("maps semi, quotes, and print width", () => {
    const result = buildFmtFlags({
      semi: false,
      singleQuote: true,
      printWidth: 100,
    })
    expect(result.ok).toBe(true)
    expect(result.flags).toEqual(["--no-semi", "--single-quote", "--print-width=100"])
  })

  test("ignores unknown option keys", () => {
    const result = buildFmtFlags({
      semi: false,
      evil: "--write /",
      plugin: "hack",
    } as Record<string, unknown>)
    expect(result.ok).toBe(true)
    expect(result.flags).toEqual(["--no-semi"])
  })

  test("rejects out-of-range printWidth", () => {
    const low = buildFmtFlags({ printWidth: 20 })
    expect(low.ok).toBe(false)
    const high = buildFmtFlags({ printWidth: 200 })
    expect(high.ok).toBe(false)
  })
})
