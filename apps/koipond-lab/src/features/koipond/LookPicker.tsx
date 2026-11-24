import { LOOKS } from "@hxlfed/koipond"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LOOK_ORDER, type PondLook } from "./defaults"

type Props = {
  value: PondLook
  onChange: (look: PondLook) => void
}

export function LookPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs leading-relaxed">
        Every built-in key from <code className="text-[0.7rem]">LOOKS</code> — the pond ripples
        live when you switch.
      </p>
      <div className="flex flex-wrap gap-1.5" role="listbox" aria-label="Pond look">
        {LOOK_ORDER.map((key) => {
          const active = value === key
          const mode = LOOKS[key]?.mode
          return (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              aria-selected={active}
              role="option"
              className="font-mono text-xs capitalize"
              onClick={() => onChange(key)}
            >
              {key}
              {mode === "dither" ? (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-[0.65rem]">
                  dither
                </Badge>
              ) : null}
            </Button>
          )
        })}
      </div>
    </div>
  )
}