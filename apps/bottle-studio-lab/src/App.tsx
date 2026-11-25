import { Badge } from "@/components/ui/badge"
import { UpstreamStage } from "@/features/studio/UpstreamStage"
import { UPSTREAM_PIN } from "@/upstream/bottle-studio-api"

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5 md:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-sm font-semibold tracking-tight md:text-base">
            Bottle Studio Lab
          </h1>
          <Badge variant="secondary" className="text-[10px] uppercase">
            Real upstream
          </Badge>
          <span className="text-xs text-muted-foreground">
            {UPSTREAM_PIN.tag} ·{" "}
            <code className="text-[10px]">{UPSTREAM_PIN.commit.slice(0, 7)}</code>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={UPSTREAM_PIN.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-6 items-center rounded-md border border-border px-2 text-xs hover:bg-muted"
          >
            Upstream repo
          </a>
          <a
            href={`${import.meta.env.BASE_URL}bottle-studio/index.html`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-6 items-center rounded-md px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Open stage
          </a>
        </div>
      </header>
      <main className="flex-1">
        <UpstreamStage />
      </main>
    </div>
  )
}