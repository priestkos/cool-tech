import { describe, expect, test } from "bun:test"
import { LOOKS } from "@hxlfed/koipond"
import { LOOK_ORDER, mergeWater, POND_DEFAULTS, toKoiPondProps } from "./defaults"

describe("koipond lab defaults", () => {
  test("LOOK_ORDER lists every LOOKS key", () => {
    const keys = Object.keys(LOOKS).sort()
    expect([...LOOK_ORDER].sort()).toEqual(keys)
  })

  test("defaults map to KoiPond props", () => {
    const props = toKoiPondProps(POND_DEFAULTS)
    expect(props.look).toBe("natural")
    expect(props.fish).toBe(12)
    expect(props.fishSize).toBe(0.18)
    expect(props.water).toBeUndefined()
    expect(props.interactive).toBe(true)
  })

  test("water override passes through when enabled", () => {
    const props = toKoiPondProps({
      ...POND_DEFAULTS,
      waterOverrideEnabled: true,
      water: { caustics: 0.5, shallow: "#112233" },
    })
    expect(props.water?.caustics).toBe(0.5)
    expect(props.water?.shallow).toBe("#112233")
  })

  test("mergeWater keeps untouched fields when patching clarity", () => {
    const next = mergeWater(POND_DEFAULTS.water, { clarity: 0.25 })
    expect(next.caustics).toBe(1)
    expect(next.waves).toBe(1)
    expect(next.clarity).toBe(0.25)
  })

  test("mergeWater adds shallow and overrides caustics", () => {
    const next = mergeWater(POND_DEFAULTS.water, { shallow: "#112233", caustics: 0.2 })
    expect(next.shallow).toBe("#112233")
    expect(next.caustics).toBe(0.2)
    expect(next.waves).toBe(1)
    expect(next.clarity).toBe(1)
  })

  test("merged water stays omitted unless the override is enabled", () => {
    const water = mergeWater(POND_DEFAULTS.water, { clarity: 0.25, caustics: 0.4 })
    const hidden = toKoiPondProps({ ...POND_DEFAULTS, water, waterOverrideEnabled: false })
    expect(hidden.water).toBeUndefined()
    const shown = toKoiPondProps({ ...POND_DEFAULTS, water, waterOverrideEnabled: true })
    expect(shown.water?.clarity).toBe(0.25)
    expect(shown.water?.caustics).toBe(0.4)
    expect(shown.water?.waves).toBe(1)
  })
})