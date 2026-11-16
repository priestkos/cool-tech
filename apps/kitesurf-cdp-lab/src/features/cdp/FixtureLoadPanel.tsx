import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { LabPage } from "@/fixtures/pages"

type Props = {
  pages: LabPage[]
  selectedId: string
  onSelect: (id: string) => void
  onLoad: () => void
  loadIndex: number
  maxIndex: number
  onScrub: (index: number) => void
}

export function FixtureLoadPanel({
  pages,
  selectedId,
  onSelect,
  onLoad,
  loadIndex,
  maxIndex,
  onScrub,
}: Props) {
  const page = pages.find((p) => p.id === selectedId)

  return (
    <section className="space-y-4" aria-labelledby="fixture-heading">
      <div className="space-y-2">
        <h2 id="fixture-heading" className="font-heading text-sm font-medium">
          Fixture page load
        </h2>
        <Label htmlFor="page-select">URL (fixture list)</Label>
        <select
          id="page-select"
          className="border-input bg-card w-full rounded-md border px-2 py-1.5 text-xs"
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
        >
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.url}
            </option>
          ))}
        </select>
        {page ? (
          <p className="text-muted-foreground text-xs">{page.description}</p>
        ) : null}
      </div>
      <Button type="button" onClick={onLoad} className="w-full sm:w-auto">
        Run Page.navigate (replay)
      </Button>
      <div className="space-y-2">
        <Label htmlFor="load-scrub">
          CDP transcript scrub · step {loadIndex + 1}/{maxIndex + 1}
        </Label>
        <input
          id="load-scrub"
          type="range"
          min={0}
          max={maxIndex}
          value={loadIndex}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="accent-primary w-full"
          aria-label="Scrub page load CDP transcript"
        />
      </div>
    </section>
  )
}