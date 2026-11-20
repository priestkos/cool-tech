import { Badge } from "@/components/ui/badge"
import { AboutPanel } from "@/features/lab/AboutPanel"
import { AgentLoopPanel } from "@/features/lab/AgentLoopPanel"
import { ControlPanel } from "@/features/lab/ControlPanel"
import { StatusDoctorPanel } from "@/features/lab/StatusDoctorPanel"
import { ViewerPanel } from "@/features/lab/ViewerPanel"
import { useRelayLab } from "@/features/lab/useRelayLab"

export default function App() {
  const lab = useRelayLab()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                screen-relay Console
              </h1>
              <Badge variant="outline">screen-relay@0.1.0</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Local lab for the real Vercel Labs desktop relay: SDK attach, viewer, agent control
              loop, and doctor readout. Default mock mode — zero external runtime requests.
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:max-w-xs sm:text-right">
            Node ≥22 for SDK · loopback 127.0.0.1:8080
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-2">
        <div className="space-y-6">
          <ControlPanel
            state={lab.state}
            busy={lab.busy}
            error={lab.error}
            onConnect={(forceMock) => void lab.connect(forceMock)}
            onDisconnect={() => void lab.disconnect()}
            onClaimPanel={() => void lab.claimPanel()}
            onReleaseControl={() => void lab.releaseControl()}
          />
          <ViewerPanel
            state={lab.state}
            busy={lab.busy}
            frameUrl={lab.frameUrl}
            liveViewerUrl={lab.liveViewerUrl}
            onViewerMode={(mode) => void lab.setViewerMode(mode)}
          />
        </div>
        <div className="space-y-6">
          <AgentLoopPanel
            state={lab.state}
            busy={lab.busy}
            onRun={() => void lab.runAgentLoop()}
          />
          <StatusDoctorPanel
            state={lab.state}
            busy={lab.busy}
            onRefreshDoctor={() => void lab.refreshDoctor()}
          />
          <AboutPanel />
        </div>
      </main>
    </div>
  )
}