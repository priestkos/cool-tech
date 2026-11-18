import { describe, expect, test } from "bun:test"
import {
  createTypeahead,
  idPart,
  isDismissal,
  isTypeaheadKey,
  openAttrs,
  popupState,
  reorderMessage,
} from "@ui-sdk/core"
import { movedTo } from "../sdk/reorder"

describe("@ui-sdk/core openAttrs", () => {
  test("marks open vs closed data attributes", () => {
    expect(openAttrs(true)).toEqual({ "data-open": "", "data-closed": undefined })
    expect(openAttrs(false)).toEqual({ "data-open": undefined, "data-closed": "" })
  })
})

describe("@ui-sdk/core dismiss", () => {
  test("isDismissal recognizes upstream dismiss reasons", () => {
    expect(isDismissal("escape-key")).toBe(true)
    expect(isDismissal("outside-press")).toBe(true)
    expect(isDismissal("trigger-press")).toBe(false)
  })
})

describe("@ui-sdk/core popupState", () => {
  test("derives initial open state from options", () => {
    const closed = popupState({ defaultOpen: false })
    expect(closed.open).toBe(false)
    expect(closed.mounted).toBe(false)

    const open = popupState({ defaultOpen: true })
    expect(open.open).toBe(true)
    expect(open.mounted).toBe(true)
  })
})

describe("@ui-sdk/core typeahead", () => {
  test("steps matching prefixes", () => {
    const typeahead = createTypeahead(500)
    const labels = ["Dog", "Cat", "Cow", "Llama"]
    expect(typeahead("c", labels, -1)).toBe(1)
    expect(typeahead("c", labels, 1)).toBe(2)
    typeahead.reset()
    expect(typeahead("l", labels, -1)).toBe(3)
  })

  test("isTypeaheadKey is exported", () => {
    expect(typeof isTypeaheadKey).toBe("function")
  })
})

describe("@ui-sdk/core reorder", () => {
  test("movedTo reorders keys", () => {
    expect(movedTo(["a", "b", "c"], "a", 2)).toEqual(["b", "c", "a"])
  })

  test("reorderMessage formats move announcements", () => {
    expect(
      reorderMessage({
        type: "move",
        key: "t1",
        label: "Task A",
        count: 1,
        position: 3,
        total: 4,
      }),
    ).toContain("Task A")
  })
})

describe("@ui-sdk/core idPart", () => {
  test("escapes unsafe id fragments", () => {
    expect(idPart("hello world")).not.toContain(" ")
  })
})