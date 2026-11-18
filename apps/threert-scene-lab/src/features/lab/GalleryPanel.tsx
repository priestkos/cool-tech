import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SampleScene } from "@/features/scene/samples"

type Props = {
  samples: SampleScene[]
  activeSlug: string
  onSelect: (slug: string) => void
}

export function GalleryPanel({ samples, activeSlug, onSelect }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Sample scenes (lab JSON → @threert/scene)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {samples.map((sample) => (
          <div
            key={sample.slug}
            className="flex flex-col gap-1 rounded-lg border border-border p-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium">{sample.doc.meta.name}</p>
              <p className="text-[11px] text-muted-foreground">{sample.blurb}</p>
            </div>
            <div className="flex items-center gap-2">
              {sample.slug === activeSlug && <Badge variant="secondary">Active</Badge>}
              <Button
                type="button"
                size="sm"
                variant={sample.slug === activeSlug ? "secondary" : "default"}
                onClick={() => onSelect(sample.slug)}
              >
                Load
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}