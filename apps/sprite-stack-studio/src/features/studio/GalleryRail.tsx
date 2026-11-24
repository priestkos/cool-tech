import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type GalleryItem = {
  id: string
  title: string
  sheetUrl?: string
  stripUrl?: string
  viewerUrl: string
  options?: {
    round?: boolean
    slices?: number | null
    colours?: number
  }
}

type Props = {
  items: GalleryItem[]
  activeId?: string
  onSelect: (item: GalleryItem) => void
}

export function GalleryRail({ items, activeId, onSelect }: Props) {
  return (
    <Card className="border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Sample gallery</CardTitle>
        <p className="text-xs text-muted-foreground">
          Original demo 4-view sheets, pre-carved with the real CLI.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={activeId === item.id ? "default" : "outline"}
            className="h-auto justify-start px-3 py-2 text-left"
            onClick={() => onSelect(item)}
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-[10px] text-muted-foreground">
                {item.options?.round ? "round · " : ""}
                {item.options?.slices ?? "auto"} slices
              </span>
            </span>
          </Button>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Run <code className="text-[10px]">bun run prepare:gallery</code> to build samples.
          </p>
        )}
      </CardContent>
    </Card>
  )
}