import { useEffect, useState } from "react"
import type { FaceState } from "glorpies"
import { AgentRoster, pokeAgentFace } from "@/components/agent-roster"
import { ActivityLog } from "@/components/activity-log"
import { SeedExplorer } from "@/components/seed-explorer"
import { SiteHeader } from "@/components/site-header"
import { SizeStrip } from "@/components/size-strip"
import { usePersistedApp } from "@/hooks/use-persisted-app"
import type { RosterAgent } from "@/lib/agent-state-machine"

export default function App() {
  const { state, dispatch, selectedId, setSelectedId, resolvedStates } = usePersistedApp()
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    const unsub = subscribeStateChanges(state.agents, resolvedStates, setLog)
    return unsub
  }, [resolvedStates, state.agents])

  return (
    <div className="bg-background text-foreground min-h-svh">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AgentRoster
            agents={state.agents}
            states={resolvedStates}
            selectedId={selectedId}
            simulate={state.simulate}
            onSelect={setSelectedId}
            onSimulateChange={(simulate) => dispatch({ type: "patch", patch: { simulate } })}
            onPinState={(id, next) => dispatch({ type: "pin", id, state: next })}
            onPoke={pokeAgentFace}
          />
          <SizeStrip agents={state.agents} states={resolvedStates} />
        </div>
        <div className="space-y-6">
          <SeedExplorer
            explorer={state.explorer}
            onChange={(patch) =>
              dispatch({ type: "patch", patch: { explorer: { ...state.explorer, ...patch } } })
            }
            onAddToRoster={(agent) =>
              dispatch({
                type: "patch",
                patch: { agents: [...state.agents, agent] },
              })
            }
          />
          <ActivityLog entries={log} />
        </div>
      </main>
      <footer className="text-muted-foreground mx-auto max-w-6xl px-4 pb-8 text-center text-xs">
        Avatars by glorpies (MIT) by sunrakerr
      </footer>
    </div>
  )
}

const prevSnapshot: Record<string, FaceState> = {}

function subscribeStateChanges(
  agents: RosterAgent[],
  resolved: Record<string, FaceState>,
  append: (updater: (prev: string[]) => string[]) => void,
) {
  for (const agent of agents) {
    const next = resolved[agent.id] ?? "idle"
    const prev = prevSnapshot[agent.id]
    if (prev && prev !== next) {
      append((lines) => [`${agent.name}: ${prev} → ${next}`, ...lines].slice(0, 40))
    }
    prevSnapshot[agent.id] = next
  }
  return () => {}
}
