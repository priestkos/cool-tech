import { Badge } from "@/components/ui/badge"

export function SiteHeader() {
  return (
    <header className="border-b bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Anatomy Machine Lab</h1>
            <Badge variant="outline">Unofficial demo</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Unofficial community demo. Not affiliated with wheresryan22 or Anatomy. The real
            Anatomy is an agent skill that generates machines from a question; this page shows
            three hand-built machines and does not run it.
          </p>
        </div>
        <nav className="text-sm">
          <a
            className="text-primary underline-offset-4 hover:underline"
            href="https://github.com/wheresryan22/anatomy"
            target="_blank"
            rel="noreferrer"
          >
            Inspired by wheresryan22/anatomy
          </a>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t py-6 text-center text-muted-foreground text-xs">
      Idea inspired by wheresryan22/anatomy · Built for cool-tech demos
    </footer>
  )
}
