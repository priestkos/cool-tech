import { createHash } from "node:crypto"
import { describe, expect, test } from "bun:test"

import { sha256HexOfUtf8 } from "./sha256-sync.ts"

function oracle(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex")
}

describe("sha256 sync", () => {
  test("matches SHA-256 for empty, one-block, and multi-block input", () => {
    const samples = [
      "",
      "abc",
      "a".repeat(55),
      "a".repeat(56),
      "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
      "a".repeat(1000),
    ]

    for (const sample of samples) {
      expect(sha256HexOfUtf8(sample)).toBe(oracle(sample))
    }
  })

  test("hashes UTF-8 code units, not UTF-16 code units", () => {
    const input = "café 🌍"
    expect(sha256HexOfUtf8(input)).toBe(oracle(input))
    expect(sha256HexOfUtf8(input)).not.toBe(sha256HexOfUtf8("cafe"))
  })
})
