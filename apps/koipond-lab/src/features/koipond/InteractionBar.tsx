import type { RefObject } from "react"
import type { KoiPondHandle } from "@hxlfed/koipond"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { PondLab } from "./usePondLab"

type Props = {
  pondRef: RefObject<KoiPondHandle | null>
  lab: PondLab
}

export function InteractionBar({ pondRef, lab }: Props) {
  const feed = () => pondRef.current?.feed(lab.feedX, lab.feedY)
  const ripple = () => pondRef.current?.ripple(lab.feedX, lab.feedY)
  const current = () => pondRef.current?.current(0.15, 0)

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs leading-relaxed">
        Double-tap or long-press on the pond drops food (upstream). Lab handle coordinates are
        0–1 across the surface.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <SliderField id="feed-x" label="feed X" value={lab.feedX} onChange={lab.setFeedX} />
        <SliderField id="feed-y" label="feed Y" value={lab.feedY} onChange={lab.setFeedY} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={feed}>
          Feed
        </Button>
        <Button type="button" variant="outline" onClick={ripple}>
          Ripple
        </Button>
        <Button type="button" variant="outline" onClick={current}>
          Current
        </Button>
      </div>
    </div>
  )
}

function SliderField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="font-mono text-xs">
          {label}
        </Label>
        <span className="text-muted-foreground font-mono text-xs">{value.toFixed(2)}</span>
      </div>
      <Slider
        id={id}
        min={0}
        max={1}
        step={0.02}
        value={[value]}
        onValueChange={(v) => {
          const n = Array.isArray(v) ? v[0] : v
          if (typeof n === "number") onChange(n)
        }}
        aria-label={label}
      />
    </div>
  )
}