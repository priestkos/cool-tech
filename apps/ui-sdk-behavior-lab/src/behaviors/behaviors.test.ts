import { describe, expect, test } from "bun:test"
import { collectAriaAttributes } from "./aria"
import {
  dismissSignalFromKey,
  shouldCloseOnOutsideClick,
} from "./dismiss"
import { formatReorderAnnouncement } from "./live-region"
import { reducePopupOpen } from "./popup"
import { isSelected, selectSingle, toggleMulti } from "./selection"
import { moveItemInList } from "./sortable"
import {
  advanceTypeaheadIndex,
  filterByTypeahead,
  matchTypeaheadPrefix,
} from "./typeahead"

describe("popup", () => {
  test("open, close, toggle", () => {
    expect(reducePopupOpen(false, "open")).toBe(true)
    expect(reducePopupOpen(true, "close")).toBe(false)
    expect(reducePopupOpen(false, "toggle")).toBe(true)
    expect(reducePopupOpen(true, "toggle")).toBe(false)
  })
})

describe("dismiss", () => {
  test("escape maps to dismiss signal", () => {
    expect(dismissSignalFromKey("Escape")).toBe("escape")
    expect(dismissSignalFromKey("Enter")).toBe("none")
  })

  test("outside click when target outside container", () => {
    const child = { id: "child" }
    const outside = { id: "outside" }
    const parent = {
      contains(node: unknown) {
        return node === child
      },
    }
    expect(shouldCloseOnOutsideClick(parent, child)).toBe(false)
    expect(shouldCloseOnOutsideClick(parent, outside)).toBe(true)
  })
})

describe("selection", () => {
  const items = [
    { id: "a", label: "Alpha" },
    { id: "b", label: "Beta" },
  ]

  test("single select", () => {
    expect(selectSingle(null, "a")).toBe("a")
    expect(selectSingle("a", "b")).toBe("b")
  })

  test("multi toggle", () => {
    expect(toggleMulti([], "a")).toEqual(["a"])
    expect(toggleMulti(["a"], "a")).toEqual([])
    expect(isSelected(["a", "b"], "b")).toBe(true)
  })
})

describe("typeahead", () => {
  test("filters labels", () => {
    const items = [
      { id: "1", label: "Apple" },
      { id: "2", label: "Apricot" },
      { id: "3", label: "Banana" },
    ]
    expect(filterByTypeahead(items, "ap")).toHaveLength(2)
    expect(filterByTypeahead(items, "")).toHaveLength(3)
  })

  test("highlight index wraps", () => {
    expect(advanceTypeaheadIndex(-1, "next", 3)).toBe(0)
    expect(advanceTypeaheadIndex(2, "next", 3)).toBe(0)
    expect(advanceTypeaheadIndex(0, "prev", 3)).toBe(2)
  })

  test("prefix match", () => {
    expect(matchTypeaheadPrefix(["Dog", "Cat", "Cow"], "c")).toBe(1)
  })
})

describe("live region", () => {
  test("reorder announcement", () => {
    expect(formatReorderAnnouncement("Task A", 0, 2)).toBe(
      "Task A moved to position 3 (from 1).",
    )
  })
})

describe("sortable", () => {
  test("moves item", () => {
    expect(moveItemInList(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"])
  })
})

describe("aria helpers", () => {
  test("collects attributes on a minimal element shim", () => {
    const el = {
      getAttribute(name: string) {
        if (name === "role") return "combobox"
        if (name === "aria-expanded") return "true"
        return null
      },
      attributes: [
        { name: "role", value: "combobox" },
        { name: "aria-expanded", value: "true" },
      ],
    } as unknown as Element
    const attrs = collectAriaAttributes(el)
    expect(
      attrs.some((a) => a.name === "aria-expanded" && a.value === "true"),
    ).toBe(true)
  })
})
