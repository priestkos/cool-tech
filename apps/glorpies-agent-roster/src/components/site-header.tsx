import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function SiteHeader() {
  return (
    <header className="border-b bg-card/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Unofficial community demo</Badge>
          <span className="text-muted-foreground text-sm">
            Not affiliated with glorpies or sunrakerr. Agents shown are fictional.
          </span>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Glorpies Agent Roster
          </h1>
          <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-relaxed">
            A browser-only fake AI team whose hand-painted alien avatars reflect each agent&apos;s
            state, plus a seed explorer for any name. Built with{" "}
            <a
              className="text-foreground underline underline-offset-4"
              href="https://github.com/sunrakerr/glorpies"
              rel="noreferrer"
              target="_blank"
            >
              glorpies
            </a>{" "}
            (MIT).
          </p>
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
          <a
            className="inline-flex items-center gap-1 hover:text-foreground"
            href="https://glorpies.sunrakerr.dev"
            rel="noreferrer"
            target="_blank"
          >
            glorpies site <ExternalLink className="size-3.5" />
          </a>
          <a
            className="inline-flex items-center gap-1 hover:text-foreground"
            href="https://x.com/friednoodlz/status/2117254897506902154"
            rel="noreferrer"
            target="_blank"
          >
            Source buzz <ExternalLink className="size-3.5" />
          </a>
        </div>
        <Separator />
      </div>
    </header>
  )
}
