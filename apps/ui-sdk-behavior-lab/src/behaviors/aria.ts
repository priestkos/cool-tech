const TRACKED_ARIA = [
  "role",
  "aria-expanded",
  "aria-controls",
  "aria-activedescendant",
  "aria-selected",
  "aria-multiselectable",
  "aria-autocomplete",
  "aria-haspopup",
  "aria-labelledby",
  "aria-label",
  "aria-live",
  "aria-atomic",
  "tabindex",
] as const

export type AriaEntry = { name: string; value: string }

export function collectAriaAttributes(
  element: Element | null,
): AriaEntry[] {
  if (!element) return []
  const out: AriaEntry[] = []
  for (const name of TRACKED_ARIA) {
    const value = element.getAttribute(name)
    if (value !== null && value !== "") {
      out.push({ name, value })
    }
  }
  for (const attr of Array.from(element.attributes)) {
    if (
      attr.name.startsWith("aria-") &&
      !TRACKED_ARIA.includes(attr.name as (typeof TRACKED_ARIA)[number]) &&
      attr.value
    ) {
      out.push({ name: attr.name, value: attr.value })
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

export function describeFocusedElement(
  active: Element | null,
): { tag: string; id: string; aria: AriaEntry[] } | null {
  if (!active || !(active instanceof HTMLElement)) return null
  return {
    tag: active.tagName.toLowerCase(),
    id: active.id || "(none)",
    aria: collectAriaAttributes(active),
  }
}
