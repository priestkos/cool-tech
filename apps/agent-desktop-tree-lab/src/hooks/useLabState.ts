import { useCallback, useEffect, useRef, useState } from "react"
import { INITIAL_JOTTER_STATE } from "@/lib/jotter-model"
import {
  MAIN_SCENARIO,
  MULTI_AGENT_SCENARIO,
  cacheRefsFromStep,
  findRefInEnvelope,
  resolveStepCommand,
  type StepRefCache,
} from "@/lib/scenarios"
import {
  createSimulatorContext,
  dispatchCommand,
  elementKeyForRef,
  formatCliLine,
  minifyEnvelope,
  parseCommandLine,
  resetSimulatorContext,
  type SimulatorContext,
} from "@/lib/simulator"
import { buildSnapshotTree } from "@/lib/tree-builder"
import {
  DEFAULT_WINDOW_SIZE,
  FULLSCREEN_ESTIMATE_SIZE,
  estimateImageTokens,
  estimateTextTokens,
  formatRatio,
} from "@/lib/tokens"
import type { Envelope, ParsedCommand } from "@/lib/types"

export interface ConsoleEntry {
  id: string
  cli: string
  envelope: Envelope
  agentId?: string
  label?: string
}

export interface AgentCursor {
  agentId: string
  elementKey: string
  color: string
}

export type ScenarioKind = "main" | "multi"

const AGENT_COLORS: Record<string, string> = {
  writer: "#2563eb",
  tidier: "#059669",
}

function liveTree(ctx: SimulatorContext) {
  const counter = Math.max(ctx.snapshotCounter, 1)
  return buildSnapshotTree(ctx.appState, counter, {
    interactiveOnly: true,
    compact: true,
  })
}

export function useLabState() {
  const ctxRef = useRef(createSimulatorContext(INITIAL_JOTTER_STATE))
  const refCacheRef = useRef<StepRefCache>({ byStep: new Map() })
  const [, bump] = useState(0)
  const refresh = () => bump((n) => n + 1)

  const [highlightKey, setHighlightKey] = useState<string | null>(null)
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([])
  const [scenarioKind, setScenarioKind] = useState<ScenarioKind>("main")
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [cursors, setCursors] = useState<AgentCursor[]>([])
  const [windowSize, setWindowSize] = useState(DEFAULT_WINDOW_SIZE)
  const [fullscreenEstimate, setFullscreenEstimate] = useState(false)
  const [tokenTotals, setTokenTotals] = useState({ tree: 0, image: 0 })

  const scenario = scenarioKind === "main" ? MAIN_SCENARIO : MULTI_AGENT_SCENARIO

  const appState = ctxRef.current.appState
  const treeBuilt = liveTree(ctxRef.current)

  const pushEntry = useCallback(
    (parsed: ParsedCommand, envelope: Envelope, label?: string) => {
      setConsoleEntries((prev) => [
        ...prev,
        {
          id: `${prev.length}-${Date.now()}`,
          cli: formatCliLine(parsed),
          envelope,
          agentId: parsed.agentId,
          label,
        },
      ])
    },
    [],
  )

  const recordTokens = useCallback(
    (envelope: Envelope) => {
      if (!envelope.ok || envelope.command !== "snapshot") return
      const json = minifyEnvelope(envelope)
      const treeTok = estimateTextTokens(json)
      const dims = fullscreenEstimate
        ? FULLSCREEN_ESTIMATE_SIZE
        : windowSize
      const imgTok = estimateImageTokens(dims.width, dims.height)
      setTokenTotals((t) => ({
        tree: t.tree + treeTok,
        image: t.image + imgTok,
      }))
    },
    [fullscreenEstimate, windowSize],
  )

  const currentSnapshotRef = useCallback(
    (kind: string, name: string, agentId?: string) => {
      const last = [...consoleEntries].reverse().find(
        (e) =>
          e.envelope.ok &&
          e.envelope.command === "snapshot" &&
          (agentId ? e.agentId === agentId : true),
      )
      if (!last) return null
      return findRefInEnvelope(last.envelope, kind, name)
    },
    [consoleEntries],
  )

  const runParsed = useCallback(
    (parsed: ParsedCommand, label?: string, stepId?: string) => {
      const refBefore = parsed.args[0]
      const envelope = dispatchCommand(ctxRef.current, parsed)
      pushEntry(parsed, envelope, label)
      recordTokens(envelope)
      if (envelope.ok && envelope.command === "snapshot" && stepId) {
        cacheRefsFromStep(stepId, envelope, refCacheRef.current)
      }
      if (parsed.agentId && refBefore?.startsWith("@")) {
        const key = elementKeyForRef(ctxRef.current, refBefore)
        if (key) {
          setCursors((prev) => {
            const rest = prev.filter((c) => c.agentId !== parsed.agentId)
            return [
              ...rest,
              {
                agentId: parsed.agentId!,
                elementKey: key,
                color: AGENT_COLORS[parsed.agentId!] ?? "#9333ea",
              },
            ]
          })
        }
      }
      refresh()
      return envelope
    },
    [pushEntry, recordTokens],
  )

  const resetAll = useCallback(() => {
    resetSimulatorContext(ctxRef.current, INITIAL_JOTTER_STATE)
    refCacheRef.current = { byStep: new Map() }
    setConsoleEntries([])
    setStepIndex(0)
    setPlaying(false)
    setCursors([])
    setTokenTotals({ tree: 0, image: 0 })
    setHighlightKey(null)
    refresh()
  }, [])

  const runUserCommand = useCallback(
    (line: string) => {
      const parsed = parseCommandLine(line)
      if (!parsed) return
      runParsed(parsed)
    },
    [runParsed],
  )

  const runScenarioStep = useCallback(
    (index: number) => {
      const step = scenario[index]
      if (!step) return
      const parsed = resolveStepCommand(
        step,
        refCacheRef.current,
        currentSnapshotRef,
      )
      if (!parsed) return
      runParsed(parsed, step.label, step.id)
      setStepIndex(index + 1)
    },
    [currentSnapshotRef, runParsed, scenario],
  )

  const stepOnce = useCallback(() => {
    if (stepIndex >= scenario.length) return
    runScenarioStep(stepIndex)
  }, [runScenarioStep, scenario.length, stepIndex])

  useEffect(() => {
    if (!playing) return
    if (stepIndex >= scenario.length) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(() => runScenarioStep(stepIndex), 900)
    return () => window.clearTimeout(t)
  }, [playing, runScenarioStep, scenario.length, stepIndex])

  const lastEnvelope = consoleEntries.at(-1)?.envelope
  const ratio = formatRatio(tokenTotals.tree, tokenTotals.image)

  const switchScenario = (k: ScenarioKind) => {
    setScenarioKind(k)
    resetSimulatorContext(ctxRef.current, INITIAL_JOTTER_STATE)
    refCacheRef.current = { byStep: new Map() }
    setConsoleEntries([])
    setStepIndex(0)
    setPlaying(false)
    setCursors([])
    setTokenTotals({ tree: 0, image: 0 })
    setHighlightKey(null)
    refresh()
  }

  return {
    appState,
    treeBuilt,
    highlightKey,
    setHighlightKey,
    consoleEntries,
    runUserCommand,
    resetAll,
    stepOnce,
    playing,
    setPlaying,
    stepIndex,
    scenario,
    scenarioKind,
    switchScenario,
    cursors,
    windowSize,
    setWindowSize,
    fullscreenEstimate,
    setFullscreenEstimate,
    tokenTotals,
    ratio,
    lastEnvelope,
  }
}
