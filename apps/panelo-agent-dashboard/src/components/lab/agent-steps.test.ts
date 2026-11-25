import { describe, expect, test } from "bun:test"

/** Mirrors useAgentChat describe() for stable log text in tests. */
function describeStep(step: { ref: string; action: string; args?: unknown[] }) {
  const { ref, action, args = [] } = step
  const [arg] = args
  switch (action) {
    case "press":
      return args.length ? `Chose ${arg} in ${ref}` : `Pressed ${ref}`
    case "setValue":
      return `Set ${ref} to “${arg}”`
    case "setChecked":
      return arg ? ref : `Turned off ${ref}`
    case "setPressed":
      return arg ? ref : `Turned off ${ref}`
    default:
      return `${action} ${ref}`
  }
}

describe("agent step descriptions", () => {
  test("setValue on search", () => {
    expect(
      describeStep({
        ref: "Search caregivers and clients",
        action: "setValue",
        args: ["Shorewood"],
      }),
    ).toBe("Set Search caregivers and clients to “Shorewood”")
  })

  test("setChecked pause switch", () => {
    expect(
      describeStep({
        ref: "Pause workflow Coverage gap alerts",
        action: "setChecked",
        args: [true],
      }),
    ).toBe("Pause workflow Coverage gap alerts")
  })
})