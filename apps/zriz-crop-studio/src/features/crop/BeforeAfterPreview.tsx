import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type Props = {
  beforeUrl: string | null
  afterUrl: string | null
  loading: boolean
  onRefresh: () => void
}

export function BeforeAfterPreview({
  beforeUrl,
  afterUrl,
  loading,
  onRefresh,
}: Props) {
  const [mode, setMode] = useState<"before" | "after">("after")
  const url = mode === "before" ? beforeUrl : afterUrl

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Preview</h3>
          <Badge variant="outline">{mode === "before" ? "Original" : "Cropped export"}</Badge>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "before" ? "default" : "outline"}
            onClick={() => setMode("before")}
          >
            Before
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "after" ? "default" : "outline"}
            onClick={() => setMode("after")}
          >
            After
          </Button>
        </div>
      </div>
      <div className="bg-muted/40 relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border">
        {url ? (
          <img
            src={url}
            alt={mode === "before" ? "Original photo" : "Cropped export preview"}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <p className="text-muted-foreground px-4 text-center text-sm">
            {mode === "after"
              ? "Adjust the crop, then refresh to render an export preview."
              : "Load a photo to see the original."}
          </p>
        )}
        {loading ? (
          <span className="bg-background/80 absolute inset-0 flex items-center justify-center text-sm">
            Rendering…
          </span>
        ) : null}
      </div>
      <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={onRefresh}>
        Refresh after preview
      </Button>
    </div>
  )
}