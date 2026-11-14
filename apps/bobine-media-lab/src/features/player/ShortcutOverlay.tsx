import { Button } from "@/components/ui/button"
import { SHORTCUT_REFERENCE } from "./shortcuts"

type ShortcutOverlayProps = {
  open: boolean
  onClose: () => void
}

export function ShortcutOverlay({ open, onClose }: ShortcutOverlayProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-title"
    >
      <div className="max-h-[min(90dvh,520px)] w-full max-w-md overflow-auto rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 id="shortcut-title" className="font-heading text-sm font-semibold">
              Keyboard shortcuts
            </h2>
            <p className="text-muted-foreground text-xs">Press ? to toggle this overlay</p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {SHORTCUT_REFERENCE.map((row) => (
            <li key={row.keys} className="flex items-center justify-between gap-3 py-2 text-xs">
              <span className="font-medium">{row.label}</span>
              <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[0.65rem]">
                {row.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}