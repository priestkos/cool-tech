/** Shared Tailwind classes for @ui-sdk/react headless parts in this lab. */
export const sdkInputClass =
  "h-9 w-full min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"

export const sdkTriggerClass =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-input bg-background px-2 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"

export const sdkPopupClass =
  "z-50 max-h-48 min-w-[var(--anchor-width,12rem)] overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"

export const sdkOptionClass =
  "relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[selected]:font-medium"

export const sdkSelectTriggerClass =
  "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"