export type FruitItem = { id: string; label: string }

export const FRUIT_ITEMS: FruitItem[] = [
  { id: "apple", label: "Apple" },
  { id: "apricot", label: "Apricot" },
  { id: "banana", label: "Banana" },
  { id: "blackberry", label: "Blackberry" },
  { id: "cherry", label: "Cherry" },
  { id: "grape", label: "Grape" },
  { id: "mango", label: "Mango" },
  { id: "orange", label: "Orange" },
]

export const FRUIT_SDK_ITEMS = FRUIT_ITEMS.map((item) => ({
  value: item.id,
  label: item.label,
}))

export const TASK_ITEMS = [
  { id: "t1", label: "Wire popup dismiss layer" },
  { id: "t2", label: "Assemble combobox recipe" },
  { id: "t3", label: "Log live-region moves" },
  { id: "t4", label: "Compare shadcn keyboard path" },
]

export type LabBehaviorId =
  | "popup"
  | "single-select"
  | "multi-select"
  | "typeahead"
  | "combobox"
  | "sortable"

export const BEHAVIOR_DEMOS: {
  id: LabBehaviorId
  title: string
  description: string
}[] = [
  {
    id: "popup",
    title: "Anchored popup",
    description:
      "@ui-sdk/react Popover: open, position, dismiss on Escape / outside press.",
  },
  {
    id: "single-select",
    title: "Single selection",
    description: "@ui-sdk/react Select with one value and aria-selected wiring.",
  },
  {
    id: "multi-select",
    title: "Multi selection",
    description: "Select with multiple — toggle items; list stays open.",
  },
  {
    id: "typeahead",
    title: "Typeahead",
    description:
      "@ui-sdk/core createTypeahead on a focusable listbox (WAI-ARIA pattern).",
  },
  {
    id: "combobox",
    title: "Composed combobox",
    description: "Official Combobox vs Base UI comparison below.",
  },
  {
    id: "sortable",
    title: "Sortable list",
    description: "Reorder with pointer; announce via reorderMessage.",
  },
]