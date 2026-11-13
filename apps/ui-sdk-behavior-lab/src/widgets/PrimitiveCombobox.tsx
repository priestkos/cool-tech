import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { advanceTypeaheadIndex, filterByTypeahead } from "@/behaviors/typeahead"
import { selectSingle, type SelectItem } from "@/behaviors/selection"
import { useAnchoredPopup } from "@/behaviors/useAnchoredPopup"
import { cn } from "@/lib/utils"

type PrimitiveComboboxProps = {
  items: readonly SelectItem[]
  label: string
  onInspectTarget?: (el: HTMLElement | null) => void
}

export function PrimitiveCombobox({
  items,
  label,
  onInspectTarget,
}: PrimitiveComboboxProps) {
  const inputId = useId()
  const [query, setQuery] = useState("")
  const [highlight, setHighlight] = useState(-1)
  const [valueId, setValueId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { open, setOpen, triggerRef, popupRef, listboxId, popupStyle } =
    useAnchoredPopup({
      onOpenChange: (next) => {
        if (next) onInspectTarget?.(inputRef.current)
      },
    })

  const filtered = useMemo(
    () => filterByTypeahead(items, query),
    [items, query],
  )

  const selectedLabel =
    items.find((i) => i.id === valueId)?.label ?? "Choose a fruit…"

  useEffect(() => {
    if (highlight >= filtered.length) {
      setHighlight(filtered.length > 0 ? 0 : -1)
    }
  }, [filtered.length, highlight])

  const commit = useCallback(
    (id: string) => {
      setValueId(selectSingle(valueId, id))
      const labelText = items.find((i) => i.id === id)?.label ?? ""
      setQuery(labelText)
      setOpen(false)
      inputRef.current?.focus()
    },
    [items, setOpen, valueId],
  )

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!open) setOpen(true)
      setHighlight((h) => advanceTypeaheadIndex(h, "next", filtered.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => advanceTypeaheadIndex(h, "prev", filtered.length))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (open && highlight >= 0 && filtered[highlight]) {
        commit(filtered[highlight].id)
      } else if (!open) {
        setOpen(true)
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-xs font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-activedescendant={
            highlight >= 0 && filtered[highlight]
              ? `${listboxId}-opt-${filtered[highlight].id}`
              : undefined
          }
          value={open ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => {
            setOpen(true)
            onInspectTarget?.(inputRef.current)
          }}
          onKeyDown={onKeyDown}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <button
          type="button"
          ref={triggerRef}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          onClick={() => setOpen(!open)}
        >
          Toggle list
        </button>
        {open ? (
          <div
            ref={popupRef}
            id={listboxId}
            role="listbox"
            style={popupStyle}
            className="max-h-48 overflow-auto rounded-md border border-border bg-popover p-1 shadow-md"
          >
            {filtered.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                No matches
              </p>
            ) : (
              filtered.map((item, index) => (
                <div
                  key={item.id}
                  id={`${listboxId}-opt-${item.id}`}
                  role="option"
                  aria-selected={valueId === item.id}
                  data-highlighted={index === highlight ? "" : undefined}
                  className={cn(
                    "cursor-default rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent",
                    valueId === item.id && "font-medium",
                  )}
                  onMouseEnter={() => setHighlight(index)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    commit(item.id)
                  }}
                >
                  {item.label}
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
      <p className="text-[0.65rem] text-muted-foreground">
        Clean-room combobox: popup + dismiss layer + typeahead + single select.
      </p>
    </div>
  )
}
