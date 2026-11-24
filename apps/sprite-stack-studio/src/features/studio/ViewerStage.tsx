type Props = {
  viewerUrl: string | null
  title: string
}

export function ViewerStage({ viewerUrl, title }: Props) {
  if (!viewerUrl) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        Select a gallery sample or upload a sheet to open the real viewer.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Embedded upstream viewer — Turntable, Scan, Exploded, Scene, Drive, weather, 16-dir export (
        <span className="font-medium text-foreground">{title}</span>).
      </p>
      <iframe
        key={viewerUrl}
        title={`Sprite stack viewer: ${title}`}
        src={viewerUrl}
        className="min-h-[min(70vh,900px)] w-full flex-1 rounded-lg border border-border bg-black"
        sandbox="allow-scripts allow-same-origin allow-downloads"
      />
    </div>
  )
}