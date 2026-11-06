import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function AppHeader() {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">Screenshot to Tokens Lab</h1>
            <Badge variant="outline">Mock providers · no API keys</Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Unofficial community demo. Not affiliated with Metatoy, nhunsaker, Sorb, or Meta.
            Inspired by{" "}
            <a
              className="underline underline-offset-2"
              href="https://github.com/nhunsaker/screenshot-to-tokens"
              rel="noreferrer"
              target="_blank"
            >
              Screenshot to Tokens (Apache-2.0)
            </a>
            . Extraction is mocked from bundled fixtures — no API keys.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            href="https://x.com/precogpunk/status/2117740495526834365"
            rel="noreferrer"
            target="_blank"
          >
            Source buzz <ExternalLink className="size-3.5" />
          </a>
          <a
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            href="https://s2t.sorbcloud.com"
            rel="noreferrer"
            target="_blank"
          >
            Upstream site <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </header>
  )
}
