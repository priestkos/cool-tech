import { describe, expect, test } from "bun:test"
import { BIOMES } from "../../../vendor/frostwind/src/biome.js"
import { buildScaleTable, assertScaleInvariants } from "../../lib/scale-authority"
import { LAB_BIOMES } from "../../lib/compile-world"
import { fnv1aHex } from "../../lib/fingerprint"

describe("scale authority", () => {
  test("traveller and roe buck come from scale.js / body-deer.js", () => {
    const rows = buildScaleTable()
    expect(assertScaleInvariants(rows)).toBe(true)
    const roe = rows.find((r) => r.id === "roe-buck")
    expect(roe?.pixels).toBe(20)
    expect(roe?.metres).toBe(1.18)
  })
})

describe("biome picker ids", () => {
  test("four lab scenes align with BIOMES rows", () => {
    for (const { id, biomeId } of LAB_BIOMES) {
      expect(BIOMES[biomeId].scene).toBe(id)
    }
  })
})

describe("fingerprint", () => {
  test("same bytes yield identical hash", () => {
    const a = new Uint8Array([1, 2, 3, 4, 5])
    expect(fnv1aHex(a)).toBe(fnv1aHex(new Uint8Array([1, 2, 3, 4, 5])))
    expect(fnv1aHex(a)).not.toBe(fnv1aHex(new Uint8Array([1, 2, 3, 4, 6])))
  })
})