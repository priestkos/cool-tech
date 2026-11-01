import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ExplorerHeader() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 sm:p-4">
      <div className="pointer-events-auto flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl space-y-1 rounded-lg border border-border/60 bg-background/85 p-3 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight">Spark Radix Explorer</h1>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              Unofficial demo
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Not affiliated with World Labs or the Spark team. WebGPU recommended; Radix falls back to
            WebGL2 where WebGPU is unavailable.
          </p>
          <nav className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <a
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              href="https://x.com/sparkjsdev/status/2115852543708536881"
              target="_blank"
              rel="noreferrer"
            >
              X post <ExternalLink className="size-3" />
            </a>
            <a
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              href="https://github.com/sparkjsdev/radix"
              target="_blank"
              rel="noreferrer"
            >
              Radix repo <ExternalLink className="size-3" />
            </a>
            <a
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              href="https://www.npmjs.com/package/@sparkjsdev/radix"
              target="_blank"
              rel="noreferrer"
            >
              npm package <ExternalLink className="size-3" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
