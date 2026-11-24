import { describe, expect, test } from "bun:test"
import { LOOKS } from "@hxlfed/koipond"
import { LOOK_ORDER, POND_DEFAULTS, toKoiPondProps } from "./defaults"

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
})