import type { SelectItem } from "@/behaviors/selection"

export const FRUIT_ITEMS: SelectItem[] = [
  { id: "apple", label: "Apple" },
  { id: "apricot", label: "Apricot" },
  { id: "banana", label: "Banana" },
  { id: "blackberry", label: "Blackberry" },
  { id: "cherry", label: "Cherry" },
  { id: "grape", label: "Grape" },
  { id: "mango", label: "Mango" },
  { id: "orange", label: "Orange" },
]

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
    description: "Open, position below trigger, dismiss on Escape / outside click.",
  },
  {
    id: "single-select",
    title: "Single selection",
    description: "One active option with aria-selected wiring.",
  },
  {
    id: "multi-select",
    title: "Multi selection",
    description: "Toggle many options; listbox aria-multiselectable.",
  },
  {
    id: "typeahead",
    title: "Typeahead filter",
    description: "Narrows visible options as you type.",
  },
  {
    id: "combobox",
    title: "Composed combobox",
    description: "Popup + selection + typeahead assembled for agents.",
  },
  {
    id: "sortable",
    title: "Sortable list",
    description: "Reorder with pointer; announce new index in a live region.",
  },
]
