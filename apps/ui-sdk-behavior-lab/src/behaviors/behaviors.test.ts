import { describe, expect, test } from "bun:test"
import { collectAriaAttributes } from "./aria"
import {
  dismissSignalFromKey,
  shouldCloseOnOutsideClick,
} from "./dismiss"
import {
  formatReorderAnnouncement,
  formatSelectionAnnouncement,
} from "./live-region"
import { computePopupStyle, reducePopupOpen } from "./popup"
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

  test("anchors bottom-start and bottom-end from the trigger rect", () => {
    const rect = {
      bottom: 10,
      right: 80,
      left: 20,
      width: 60,
    } as DOMRectReadOnly

    const start = computePopupStyle(rect, "bottom-start")
    expect(start.position).toBe("fixed")
    expect(start.top).toBe(14)
    expect(start.left).toBe(20)
    expect(start.transform).toBeUndefined()
    expect(start.minWidth).toBe(60)
    expect(start.zIndex).toBe(50)

    const end = computePopupStyle(rect, "bottom-end")
    expect(end.top).toBe(14)
    expect(end.left).toBe(80)
    expect(end.transform).toBe("translateX(-100%)")
    expect(end.minWidth).toBe(60)
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

  test("ignores missing or non-element targets", () => {
    const parent = {
      contains() {
        return false
      },
    }
    expect(shouldCloseOnOutsideClick(parent, null)).toBe(false)
    expect(shouldCloseOnOutsideClick(parent, undefined)).toBe(false)
    expect(shouldCloseOnOutsideClick(parent, 1)).toBe(false)
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
    expect(toggleMulti(["a"], "b")).toEqual(["a", "b"])
    expect(isSelected(["a", "b"], "b")).toBe(true)
    expect(isSelected([], "a")).toBe(false)
    expect(items.map((item) => item.id)).toEqual(["a", "b"])
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
    expect(filterByTypeahead(items, "   ")).toHaveLength(3)
    expect(filterByTypeahead(items, "  AP ")).toEqual([
      { id: "1", label: "Apple" },
      { id: "2", label: "Apricot" },
    ])
  })

  test("highlight index wraps", () => {
    expect(advanceTypeaheadIndex(-1, "next", 3)).toBe(0)
    expect(advanceTypeaheadIndex(2, "next", 3)).toBe(0)
    expect(advanceTypeaheadIndex(0, "prev", 3)).toBe(2)
    expect(advanceTypeaheadIndex(-1, "prev", 3)).toBe(2)
    expect(advanceTypeaheadIndex(0, "next", 0)).toBe(-1)
  })

  test("prefix match", () => {
    expect(matchTypeaheadPrefix(["Dog", "Cat", "Cow"], "c")).toBe(1)
    expect(matchTypeaheadPrefix(["Dog", "Cat"], "")).toBe(-1)
    expect(matchTypeaheadPrefix(["Dog", "Cat"], "Z")).toBe(-1)
    expect(matchTypeaheadPrefix(["Dog", "Cat"], "C")).toBe(1)
  })
})

describe("live region", () => {
  test("reorder announcement", () => {
    expect(formatReorderAnnouncement("Task A", 0, 2)).toBe(
      "Task A moved to position 3 (from 1).",
    )
  })

  test("selection announcement", () => {
    expect(formatSelectionAnnouncement("Beta", true)).toBe("Beta selected.")
    expect(formatSelectionAnnouncement("Beta", false)).toBe(
      "Beta deselected.",
    )
  })
})

describe("sortable", () => {
  test("moves item", () => {
    expect(moveItemInList(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"])
  })

  test("rejects out-of-range and no-op moves without mutating the source", () => {
    const items = ["a", "b"]
    const same = moveItemInList(items, 0, 0)
    expect(same).toEqual(["a", "b"])
    expect(same).not.toBe(items)
    expect(moveItemInList(items, -1, 0)).toEqual(["a", "b"])
    expect(moveItemInList(items, 0, 5)).toEqual(["a", "b"])
    expect(items).toEqual(["a", "b"])
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

  test("skips empty values, includes untracked aria attributes, and sorts", () => {
    expect(collectAriaAttributes(null)).toEqual([])
    const el = {
      getAttribute(name: string) {
        if (name === "aria-label") return ""
        if (name === "role") return "listbox"
        return null
      },
      attributes: [
        { name: "aria-label", value: "" },
        { name: "role", value: "listbox" },
        { name: "aria-describedby", value: "hint" },
      ],
    } as unknown as Element
    expect(collectAriaAttributes(el)).toEqual([
      { name: "aria-describedby", value: "hint" },
      { name: "role", value: "listbox" },
    ])
  })
})
