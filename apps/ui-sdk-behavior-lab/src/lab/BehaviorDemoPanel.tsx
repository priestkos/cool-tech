import { createTypeahead, isTypeaheadKey, labelOf } from "@ui-sdk/core"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { useMemo, useRef, useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { BEHAVIOR_DEMOS, FRUIT_SDK_ITEMS, type LabBehaviorId } from "@/lib/fixtures"
import {
  sdkOptionClass,
  sdkPopupClass,
  sdkSelectTriggerClass,
} from "@/lib/sdk-styles"
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
  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          const trigger = document.querySelector<HTMLButtonElement>(
            '[data-slot="sdk-popup-trigger"]',
          )
          onInspectTarget(trigger ?? null)
        }
      }}
    >
      <PopoverTrigger
        data-slot="sdk-popup-trigger"
        className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        onFocus={(e) => onInspectTarget(e.currentTarget)}
      >
        Open popover
      </PopoverTrigger>
      <PopoverContent className={cn(sdkPopupClass, "w-64 p-3")} sideOffset={6}>
        <PopoverTitle className="text-sm font-medium">Dismiss layer</PopoverTitle>
        <PopoverDescription className="mt-1 text-xs text-muted-foreground">
          Escape or an outside press closes this panel (@ui-sdk/react/popover).
        </PopoverDescription>
        <PopoverClose className="mt-3 inline-flex h-8 items-center rounded-md border border-border px-2 text-xs">
          Close
        </PopoverClose>
      </PopoverContent>
    </Popover>
  )
}

function SingleSelectDemo({
  onInspectTarget,
}: {
  onInspectTarget: (el: HTMLElement | null) => void
}) {
  const slice = FRUIT_SDK_ITEMS.slice(0, 5)
  return (
    <Select
      items={slice}
      placeholder="Pick a fruit"
      onOpenChange={(open) => {
        if (open) {
          const trigger = document.querySelector<HTMLElement>(
            '[data-slot="sdk-select-trigger"]',
          )
          onInspectTarget(trigger ?? null)
        }
      }}
    >
      <SelectLabel className="text-xs font-medium">Fruits</SelectLabel>
      <SelectTrigger
        data-slot="sdk-select-trigger"
        className={sdkSelectTriggerClass}
        onFocus={(e) => onInspectTarget(e.currentTarget)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={sdkPopupClass}>
        {slice.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            label={item.label}
            className={sdkOptionClass}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function MultiSelectDemo({
  onInspectTarget,
  onAnnounce,
}: {
  onInspectTarget: (el: HTMLElement | null) => void
  onAnnounce: (text: string) => void
}) {
  const slice = FRUIT_SDK_ITEMS.slice(0, 6)
  return (
    <Select
      multiple
      items={slice}
      defaultValue={[]}
      placeholder="Favorite fruits"
      onValueChange={(value) => {
        const count = Array.isArray(value) ? value.length : 0
        onAnnounce(`Selected ${count} fruit(s) via @ui-sdk/react Select.`)
      }}
      onOpenChange={(open) => {
        if (open) onInspectTarget(document.activeElement as HTMLElement | null)
      }}
    >
      <SelectLabel className="text-xs font-medium">Multi</SelectLabel>
      <SelectTrigger className={sdkSelectTriggerClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={sdkPopupClass}>
        {slice.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            label={item.label}
            className={sdkOptionClass}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function TypeaheadDemo({
  onInspectTarget,
}: {
  onInspectTarget: (el: HTMLElement | null) => void
}) {
  const typeahead = useMemo(() => createTypeahead(400), [])
  const listRef = useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = useState(-1)
  const options = FRUIT_SDK_ITEMS.slice(0, 8)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isTypeaheadKey(event.nativeEvent)) return
    const nodes = listRef.current?.querySelectorAll<HTMLElement>("[role=option]")
    if (!nodes?.length) return
    const labels = Array.from(nodes).map((node) => labelOf(node))
    const index = typeahead(event.key, labels, focusIndex)
    if (index >= 0) {
      event.preventDefault()
      setFocusIndex(index)
      nodes[index]?.focus()
    }
  }

  return (
    <div className="max-w-xs space-y-2">
      <p className="text-xs text-muted-foreground">
        Focus the listbox and type letters —{" "}
        <code className="text-[0.6rem]">createTypeahead</code> from @ui-sdk/core.
      </p>
      <div
        ref={listRef}
        role="listbox"
        aria-label="Fruits (typeahead)"
        tabIndex={0}
        className="max-h-40 space-y-0.5 overflow-auto rounded-md border border-border p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        onKeyDown={onKeyDown}
        onFocus={(e) => onInspectTarget(e.currentTarget)}
      >
        {options.map((item, index) => (
          <div
            key={item.value}
            role="option"
            tabIndex={-1}
            aria-selected={focusIndex === index}
            className={cn(
              sdkOptionClass,
              focusIndex === index && "bg-accent",
            )}
            onFocus={() => setFocusIndex(index)}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}