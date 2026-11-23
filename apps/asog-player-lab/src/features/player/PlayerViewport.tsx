import { cn } from "@/lib/utils"
import { useAsogPlayerContext } from "./AsogPlayerContext"

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  className?: string
}

export function PlayerViewport({ canvasRef, className }: Props) {
  const lab = useAsogPlayerContext()

  return (
    <div className={cn("relative flex min-h-[min(70dvh,520px)] flex-col", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block size-full rounded-lg bg-black"
        aria-label="Animated SOG splat viewport"
      />
      {(lab.phase === "loading" || lab.phase === "idle") && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4">
          <div className="bg-card/90 text-card-foreground rounded-md border px-3 py-2 text-xs shadow-sm backdrop-blur-sm">
            Loading… {Math.round(lab.loadProgress * 100)}%
            <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${Math.round(lab.loadProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
      {lab.phase === "no-webgl" && (
        <div className="bg-destructive/10 text-destructive absolute inset-0 z-10 flex items-center justify-center p-6 text-center text-sm">
          {lab.error}
        </div>
      )}
      {lab.phase === "error" && (
        <div className="bg-destructive/10 text-destructive absolute inset-0 z-10 flex items-center justify-center p-6 text-center text-sm">
          Could not load clip: {lab.error}
        </div>
      )}
    </div>
  )
}