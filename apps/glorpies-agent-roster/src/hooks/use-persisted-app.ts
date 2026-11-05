import { useEffect, useMemo, useReducer, useState } from "react"
import type { FaceState } from "glorpies"
import { agentSeedFromName, stateAtTick } from "@/lib/agent-state-machine"
import {
  loadInitialState,
  mergePersisted,
  type PersistedAppState,
  writeHashState,
  writeLocalState,
} from "@/lib/app-state"

type Action =
  | { type: "replace"; state: PersistedAppState }
  | { type: "patch"; patch: Partial<PersistedAppState> }
  | { type: "pin"; id: string; state: FaceState | null }
  | { type: "tick" }

function reducer(state: PersistedAppState, action: Action): PersistedAppState {
  switch (action.type) {
    case "replace":
      return action.state
    case "patch":
      return mergePersisted(state, action.patch)
    case "pin": {
      const pinned = { ...state.pinned }
      if (action.state === null) delete pinned[action.id]
      else pinned[action.id] = action.state
      return { ...state, pinned }
    }
    case "tick":
      return { ...state, tick: state.tick + 1 }
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}

export function usePersistedApp() {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState)
  const [selectedId, setSelectedId] = useState<string>(state.agents[0]?.id ?? "a1")

  useEffect(() => {
    writeLocalState(state)
    writeHashState(state)
  }, [state])

  useEffect(() => {
    if (!state.simulate) return
    const id = window.setInterval(() => dispatch({ type: "tick" }), 1800)
    return () => window.clearInterval(id)
  }, [state.simulate])

  const resolvedStates = useMemo(() => {
    const map: Record<string, FaceState> = {}
    state.agents.forEach((agent, index) => {
      if (state.pinned[agent.id]) {
        map[agent.id] = state.pinned[agent.id]!
        return
      }
      if (state.simulate) {
        map[agent.id] = stateAtTick(state.tick, index, agentSeedFromName(agent.name))
      } else {
        map[agent.id] = "idle"
      }
    })
    return map
  }, [state.agents, state.pinned, state.simulate, state.tick])

  return {
    state,
    dispatch,
    selectedId,
    setSelectedId,
    resolvedStates,
  }
}
