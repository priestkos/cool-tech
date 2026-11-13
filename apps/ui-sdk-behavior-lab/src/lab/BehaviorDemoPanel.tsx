import { useId, useState, type HTMLAttributes } from "react"
import { formatSelectionAnnouncement } from "@/behaviors/live-region"
import { isSelected, toggleMulti } from "@/behaviors/selection"
import { useAnchoredPopup } from "@/behaviors/useAnchoredPopup"
import { Button } from "@/components/ui/button"
import { BEHAVIOR_DEMOS, FRUIT_ITEMS, type LabBehaviorId } from "@/lib/fixtures"
import { cn } from "@/lib/utils"

type BehaviorDemoPanelProps = {
  active: LabBehaviorId
  onActiveChange: (id: LabBehaviorId) => void
  onInspectTarget: (el: HTMLElement | null) => void
  onAnnounce: (text: string) => void
}

export function BehaviorDemoPanel({
  active,
  onActiveChange,
  onInspectTarget,
  onAnnounce,
}: BehaviorDemoPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {BEHAVIOR_DEMOS.map((demo) => (
          <Button
            key={demo.id}
            type="button"
            size="sm"
            variant={active === demo.id ? "default" : "outline"}
            onClick={() => onActiveChange(demo.id)}
          >
            {demo.title}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {BEHAVIOR_DEMOS.find((d) => d.id === active)?.description}
      </p>
      <div className="rounded-lg border border-border bg-card p-4">
        {active === "popup" ? (
          <PopupDemo onInspectTarget={onInspectTarget} />
        ) : null}
        {active === "single-select" ? (
          <SingleSelectDemo onInspectTarget={onInspectTarget} />
        ) : null}
        {active === "multi-select" ? (
          <MultiSelectDemo
            onInspectTarget={onInspectTarget}
            onAnnounce={onAnnounce}
          />
        ) : null}
        {active === "typeahead" ? (
          <TypeaheadDemo onInspectTarget={onInspectTarget} />
        ) : null}
        {active === "combobox" || active === "sortable" ? (
          <p className="text-sm text-muted-foreground">
            Use the combobox comparison and sortable sections below for these
            behaviors.
          </p>
        ) : null}
      </div>
    </div>
  )
}

function PopupDemo({
  onInspectTarget,
}: {
  onInspectTarget: (el: HTMLElement | null) => void
}) {
  const { open, toggle, triggerRef, popupRef, popupStyle } = useAnchoredPopup()
  return (
    <div className="space-y-2">
      <Button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          toggle()
          onInspectTarget(triggerRef.current)
        }}
      >
        {open ? "Close popup" : "Open popup"}
      </Button>
      {open ? (
        <div
          ref={popupRef}
          role="dialog"
          aria-modal="false"
          style={popupStyle}
          className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md"
          tabIndex={-1}
        >
          Dismiss with Escape or an outside click.
        </div>
      ) : null}
    </div>
  )
}

function SingleSelectDemo({
  onInspectTarget,
}: {
  onInspectTarget: (el: HTMLElement | null) => void
}) {
  const listId = useId()
  const [value, setValue] = useState<string | null>(null)
  return (
    <div
      id={listId}
      role="listbox"
      aria-label="Fruits"
      className="max-w-xs space-y-1"
      onFocus={(e) => onInspectTarget(e.currentTarget)}
      tabIndex={0}
    >
      {FRUIT_ITEMS.slice(0, 5).map((item) => (
        <div
          key={item.id}
          role="option"
          aria-selected={value === item.id}
          tabIndex={-1}
          className={cn(
            "cursor-pointer rounded-sm px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            value === item.id && "bg-accent font-medium",
          )}
          onClick={() => setValue(item.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setValue(item.id)
            }
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}

function MultiSelectDemo({
  onInspectTarget,
  onAnnounce,
}: {
  onInspectTarget: (el: HTMLElement | null) => void
  onAnnounce: (text: string) => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <div
      role="listbox"
      aria-multiselectable="true"
      aria-label="Favorite fruits"
      className="max-w-xs space-y-1"
      tabIndex={0}
      onFocus={(e) => onInspectTarget(e.currentTarget)}
    >
      {FRUIT_ITEMS.slice(0, 6).map((item) => {
        const on = isSelected(selected, item.id)
        return (
          <OptionRow
            key={item.id}
            role="option"
            aria-selected={on}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-sm",
              on && "bg-accent",
            )}
            onClick={() => {
              const next = toggleMulti(selected, item.id)
              setSelected(next)
              onAnnounce(formatSelectionAnnouncement(item.label, !on))
            }}
          >
            <input
              type="checkbox"
              readOnly
              checked={on}
              tabIndex={-1}
              aria-hidden
            />
            {item.label}
          </OptionRow>
        )
      })}
    </div>
  )
}

function TypeaheadDemo({
  onInspectTarget,
}: {
  onInspectTarget: (el: HTMLElement | null) => void
}) {
  const [query, setQuery] = useState("")
  const filtered = FRUIT_ITEMS.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <div className="max-w-xs space-y-2">
      <input
        aria-label="Filter fruits"
        className="h-8 w-full rounded-md border border-input px-2 text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={(e) => onInspectTarget(e.currentTarget)}
      />
      <ul className="text-sm text-muted-foreground">
        {filtered.map((i) => (
          <li key={i.id}>{i.label}</li>
        ))}
      </ul>
    </div>
  )
}

function OptionRow({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
