import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AgentStepLog } from "@/features/cdp/AgentStepLog"
import { ConsoleView } from "@/features/cdp/ConsoleView"
import { DomTreeView } from "@/features/cdp/DomTreeView"
import { FixtureLoadPanel } from "@/features/cdp/FixtureLoadPanel"
import { KitesurfExplainer } from "@/features/cdp/KitesurfExplainer"
import { LiveModePanel } from "@/features/cdp/LiveModePanel"
import { ScreenshotView } from "@/features/cdp/ScreenshotView"
import { useCdpLab } from "@/features/cdp/useCdpLab"

export default function App() {
  const lab = useCdpLab()
  const loadMax = lab.loadTranscript.length - 1
  const agentMax = lab.agentTranscript.length - 1

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Kitesurf CDP Lab
              </h1>
              <Badge variant="outline">Independent demo</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Offline CDP fixture replay for{" "}
              <a
                href="https://kitesurf.dev"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                Cloudflare Kitesurf
              </a>
              . No Kitesurf source or packages are bundled — only lab-authored transcripts
              and screenshots.
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:max-w-xs sm:text-right">
            Default: zero network · Live: ws://127.0.0.1:8787 only
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page load slice</CardTitle>
              <CardDescription>
                Page.navigate → DOM.getDocument → console → captureScreenshot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FixtureLoadPanel
                pages={lab.pages}
                selectedId={lab.selectedPageId}
                onSelect={(id) => {
                  lab.setSelectedPageId(id)
                  lab.scrubLoad(0)
                }}
                onLoad={lab.runLoad}
                loadIndex={lab.loadSnapshot.index}
                maxIndex={loadMax}
                onScrub={lab.scrubLoad}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <h3 className="text-xs font-medium">Screenshot</h3>
                  <ScreenshotView
                    src={lab.screenshotSrc}
                    alt="Page.captureScreenshot fixture preview"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-medium">DOM tree</h3>
                  <DomTreeView tree={lab.domTree} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-medium">Console</h3>
                  <ConsoleView lines={lab.consoleLines} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent step log</CardTitle>
              <CardDescription>
                Scripted task: find heading → click link → read text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentStepLog
                entries={lab.agentTranscript}
                index={lab.agentSnapshot.index}
                maxIndex={agentMax}
                onScrub={lab.scrubAgent}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Kitesurf</CardTitle>
              <CardDescription>Optional WebSocket CDP client</CardDescription>
            </CardHeader>
            <CardContent>
              <LiveModePanel
                enabled={lab.liveMode}
                state={lab.liveState}
                message={lab.liveMessage}
                wsUrl={lab.liveWsUrl}
                onToggle={lab.toggleLive}
              />
            </CardContent>
          </Card>
          <KitesurfExplainer />
        </div>
      </main>
    </div>
  )
}