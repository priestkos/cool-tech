import { cn } from "@/lib/utils"
import type { FixturePack } from "@/lib/fixtures/types"

type Props = {
  fixtures: FixturePack[]
  selectedId: string
  onSelect: (id: string) => void
  disabled?: boolean
}

export function FixturePicker({ fixtures, selectedId, onSelect, disabled }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {fixtures.map((fixture) => {
        const active = fixture.id === selectedId
        return (
          <button
            key={fixture.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(fixture.id)}
            className={cn(
              "group rounded-xl border bg-card p-2 text-left transition hover:border-primary/40",
              active && "border-primary ring-2 ring-primary/20",
              disabled && "opacity-60",
            )}
          >
            <img
              src={fixture.screenshotPath}
              alt=""
              className="mb-2 aspect-video w-full rounded-lg border bg-muted object-cover"
            />
            <div className="px-1 pb-1">
              <div className="font-medium">{fixture.title}</div>
              <p className="text-xs text-muted-foreground">{fixture.blurb}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
