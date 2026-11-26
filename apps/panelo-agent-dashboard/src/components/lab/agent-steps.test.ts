import { describe, expect, test } from "bun:test"
import { describeAgentStep } from "../panelo/lib/describe-step"

describe("agent step descriptions", () => {
  test("setValue on search", () => {
    expect(
      describeAgentStep({
        ref: "Search caregivers and clients",
        action: "setValue",
        args: ["Shorewood"],
      }),
    ).toBe("Set Search caregivers and clients to “Shorewood”")
  })

  test("setChecked pause switch", () => {
    expect(
      describeAgentStep({
        ref: "Pause workflow Coverage gap alerts",
        action: "setChecked",
        args: [true],
      }),
    ).toBe("Pause workflow Coverage gap alerts")
  })

  test("press with no args", () => {
    expect(describeAgentStep({ ref: "Day", action: "press" })).toBe("Pressed Day")
  })

  test("press with an arg", () => {
    expect(describeAgentStep({ ref: "Schedule view", action: "press", args: ["Week"] })).toBe(
      "Chose Week in Schedule view",
    )
  })

  test("setChecked false", () => {
    expect(
      describeAgentStep({
        ref: "Pause workflow Coverage gap alerts",
        action: "setChecked",
        args: [false],
      }),
    ).toBe("Turned off Pause workflow Coverage gap alerts")
  })

  test("setPressed false", () => {
    expect(describeAgentStep({ ref: "Week", action: "setPressed", args: [false] })).toBe("Turned off Week")
  })

  test("setOpen true", () => {
    expect(describeAgentStep({ ref: "Visit dialog", action: "setOpen", args: [true] })).toBe("Opened Visit dialog")
  })

  test("setOpen false", () => {
    expect(describeAgentStep({ ref: "Visit dialog", action: "setOpen", args: [false] })).toBe("Closed Visit dialog")
  })

  test("clear", () => {
    expect(describeAgentStep({ ref: "Search caregivers and clients", action: "clear" })).toBe(
      "Cleared Search caregivers and clients",
    )
  })

  test("unknown action focus", () => {
    expect(describeAgentStep({ ref: "Search caregivers and clients", action: "focus" })).toBe(
      "focus Search caregivers and clients",
    )
  })
})
