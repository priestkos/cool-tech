import { describe, expect, test } from "bun:test"
import { defaultKnobValues, schemaToKnobs } from "./knobs"

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