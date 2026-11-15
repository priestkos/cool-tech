import { describe, expect, test } from "bun:test"
import { defaultKnobValues, mergeKnobValues, paramsUrlForAsset, schemaToKnobs } from "./knobs"
import type { KnobValues } from "./types"

const schema = {
  params: {
    colorway: {
      type: "choice",
      default: "forest-green",
      label: "Colorway",
      options: ["forest-green", "winter"],
    },
    wear: { type: "range", default: 0.3, label: "Wear", min: 0, max: 1, step: 0.1 },
    stovepipe: { type: "toggle", default: true, label: "Stovepipe" },
  },
}

describe("schemaToKnobs", () => {
  test("maps control kinds", () => {
    const knobs = schemaToKnobs(schema)
    expect(knobs.map((k) => k.kind)).toEqual(["choice", "range", "toggle"])
    expect(defaultKnobValues(knobs)).toEqual({
      colorway: "forest-green",
      wear: 0.3,
      stovepipe: true,
    })
  })
})

describe("knob defaults and urls", () => {
  test("unknown types become choices and missing defaults follow the kind", () => {
    const knobs = schemaToKnobs({
      params: {
        mystery: { type: "text" },
        flag: { type: "toggle" },
        amount: { type: "range", min: 0, max: 1 },
        tint: { type: "color", default: "#fff", label: "Tint" },
      },
    })
    expect(knobs.map((k) => [k.key, k.kind, k.default, k.label])).toEqual([
      ["mystery", "choice", "", "mystery"],
      ["flag", "toggle", false, "flag"],
      ["amount", "range", 0, "amount"],
      ["tint", "color", "#fff", "Tint"],
    ])
    expect(knobs.find((k) => k.key === "amount")).toMatchObject({ min: 0, max: 1 })
    expect(knobs.find((k) => k.key === "mystery")?.options).toBeUndefined()
  })

  test("an empty params file yields no knobs", () => {
    expect(schemaToKnobs({})).toEqual([])
  })

  test("merge keeps defaults and ignores unknown keys", () => {
    const knobs = schemaToKnobs(schema)
    expect(mergeKnobValues(knobs, { wear: 0.9, extra: 1 } as Partial<KnobValues>)).toEqual({
      colorway: "forest-green",
      wear: 0.9,
      stovepipe: true,
    })
  })

  test("params URL stays local offline and uses the CDN when live", () => {
    expect(paramsUrlForAsset("cabin", false)).toBe("/data/cabin-params.json")
    expect(paramsUrlForAsset("cabin", true)).toBe("https://polyfork.dev/cdn/cabin-params.json")
  })
})