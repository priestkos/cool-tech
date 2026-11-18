import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { FRUIT_SDK_ITEMS } from "@/lib/fixtures"
import {
  sdkInputClass,
  sdkOptionClass,
  sdkPopupClass,
  sdkTriggerClass,
} from "@/lib/sdk-styles"

type SdkComboboxProps = {
  label: string
  onInspectTarget?: (el: HTMLElement | null) => void
}

export function SdkCombobox({ label, onInspectTarget }: SdkComboboxProps) {
  return (
    <div className="space-y-2">
      <Combobox
        items={FRUIT_SDK_ITEMS}
        onOpenChange={(open) => {
          if (open) {
            const input = document.querySelector<HTMLInputElement>(
              '[data-slot="sdk-combobox-input"]',
            )
            onInspectTarget?.(input ?? null)
          }
        }}
      >
        <ComboboxLabel className="text-xs font-medium">{label}</ComboboxLabel>
        <div className="flex gap-1" data-slot="row">
          <ComboboxInput
            data-slot="sdk-combobox-input"
            placeholder="Choose a fruit…"
            className={sdkInputClass}
            onFocus={(e) => onInspectTarget?.(e.currentTarget)}
          />
          <ComboboxTrigger aria-label="Show fruits" className={sdkTriggerClass}>
            ▾
          </ComboboxTrigger>
        </div>
        <ComboboxContent className={sdkPopupClass} sideOffset={4}>
          <ComboboxEmpty className="px-2 py-1.5 text-xs text-muted-foreground">
            No matches
          </ComboboxEmpty>
          <ComboboxList>
            {FRUIT_SDK_ITEMS.map((item) => (
              <ComboboxItem
                key={item.value}
                value={item.value}
                label={item.label}
                className={sdkOptionClass}
              >
                {item.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p className="text-[0.65rem] text-muted-foreground">
        Official @ui-sdk/react Combobox on @ui-sdk/core listbox + popup preset.
      </p>
    </div>
  )
}