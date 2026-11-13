import { useId } from "react"
import { Combobox } from "@base-ui/react/combobox"
import { FRUIT_ITEMS } from "@/lib/fixtures"
import { cn } from "@/lib/utils"

type ShadcnComboboxProps = {
  onInspectTarget?: (el: HTMLElement | null) => void
}

export function ShadcnCombobox({ onInspectTarget }: ShadcnComboboxProps) {
  const labelId = useId()
  const labels = FRUIT_ITEMS.map((i) => i.label)

  return (
    <div className="space-y-2">
      <span id={labelId} className="text-xs font-medium">
        shadcn / Base UI combobox
      </span>
      <Combobox.Root
        items={labels}
        autoHighlight
        onOpenChange={(next) => {
          if (next) {
            const input = document.querySelector<HTMLInputElement>(
              '[data-slot="shadcn-combobox-input"]',
            )
            onInspectTarget?.(input)
          }
        }}
      >
        <Combobox.Input
          data-slot="shadcn-combobox-input"
          aria-labelledby={labelId}
          placeholder="Pick a fruit…"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          onFocus={(e) => onInspectTarget?.(e.currentTarget)}
        />
        <Combobox.Portal>
          <Combobox.Positioner className="z-50" sideOffset={4}>
            <Combobox.Popup
              className={cn(
                "max-h-48 min-w-[var(--anchor-width)] overflow-auto rounded-md border border-border bg-popover p-1 shadow-md",
              )}
            >
              <Combobox.List>
                {(item: string) => (
                  <Combobox.Item
                    key={item}
                    value={item}
                    className="cursor-default rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent"
                  >
                    {item}
                  </Combobox.Item>
                )}
              </Combobox.List>
              <Combobox.Empty className="px-2 py-1.5 text-xs text-muted-foreground">
                No matches
              </Combobox.Empty>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
      <p className="text-[0.65rem] text-muted-foreground">
        Reference surface for keyboard comparison (not @ui-sdk/*).
      </p>
    </div>
  )
}
