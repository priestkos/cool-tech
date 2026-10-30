import type { StateName } from 'dotty-botty'

export type AgentPhase =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'working'
  | 'celebrating'
  | 'alert'
  | 'sleeping'

export type AgentLogLine =
  | { kind: 'user'; text: string }
  | { kind: 'tool'; text: string }
  | { kind: 'assistant'; text: string }
  | { kind: 'error'; text: string }

export interface AgentScript {
  id: string
  label: string
  toolCalls: string[]
  reply: string
  fail?: boolean
  errorMessage?: string
}

export interface AgentRunnerState {
  phase: AgentPhase
  log: AgentLogLine[]
  streamingText: string
  runId: number
}

export type AgentRunnerAction =
  | { type: 'typing' }
  | { type: 'send'; prompt: string; script: AgentScript | null }
  | { type: 'thinking_done' }
  | { type: 'tool_start'; tool: string }
  | { type: 'tool_done' }
  | { type: 'stream_tick'; chunk: string }
  | { type: 'stream_done' }
  | { type: 'celebrate_done' }
  | { type: 'fail'; message: string }
  | { type: 'idle_timeout' }
  | { type: 'activity' }
  | { type: 'reset_run' }

export const IDLE_MS = 20_000

export function agentPhaseToDottyState(phase: AgentPhase): StateName {
  switch (phase) {
    case 'listening':
      return 'listening'
    case 'thinking':
      return 'thinking'
    case 'working':
      return 'working'
    case 'celebrating':
      return 'celebrating'
    case 'alert':
      return 'alert'
    case 'sleeping':
      return 'sleeping'
    case 'idle':
      return 'idle'
    default: {
      const _exhaustive: never = phase
      return _exhaustive
    }
  }
}

export function initialAgentRunnerState(): AgentRunnerState {
  return { phase: 'idle', log: [], streamingText: '', runId: 0 }
}

export function reduceAgentRunner(
  state: AgentRunnerState,
  action: AgentRunnerAction,
): AgentRunnerState {
  switch (action.type) {
    case 'typing':
      if (state.phase === 'sleeping') {
        return { ...state, phase: 'listening' }
      }
      if (state.phase === 'idle' || state.phase === 'listening') {
        return { ...state, phase: 'listening' }
      }
      return state
    case 'activity':
      if (state.phase === 'sleeping') {
        return { ...state, phase: 'idle' }
      }
      return state
    case 'idle_timeout':
      if (
        state.phase === 'idle' ||
        state.phase === 'listening' ||
        state.phase === 'sleeping'
      ) {
        return { ...state, phase: 'sleeping' }
      }
      return state
    case 'send': {
      const runId = state.runId + 1
      const log: AgentLogLine[] = [
        ...state.log,
        { kind: 'user', text: action.prompt },
      ]
      return {
        phase: 'thinking',
        log,
        streamingText: '',
        runId,
      }
    }
    case 'thinking_done':
      return { ...state, phase: 'working' }
    case 'tool_start':
      return {
        ...state,
        log: [...state.log, { kind: 'tool', text: action.tool }],
        phase: 'working',
      }
    case 'fail':
      return {
        ...state,
        phase: 'alert',
        log: [...state.log, { kind: 'error', text: action.message }],
        streamingText: '',
      }
    case 'stream_tick':
      return {
        ...state,
        phase: 'working',
        streamingText: state.streamingText + action.chunk,
      }
    case 'stream_done':
      return {
        ...state,
        phase: 'celebrating',
        log: [
          ...state.log,
          { kind: 'assistant', text: state.streamingText },
        ],
        streamingText: '',
      }
    case 'celebrate_done':
      return { ...state, phase: 'idle' }
    case 'tool_done':
      return state
    case 'reset_run':
      return state
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}

export const GENERIC_REPLY =
  'Got it! This console is simulated — imagine a helpful answer landed here.'

export const SCRIPTED_PROMPTS: AgentScript[] = [
  {
    id: 'flight',
    label: 'Find a cheap flight to Goa',
    toolCalls: ['search_flights(origin="BLR", dest="GOI")', 'filter_by_price(max=8000)'],
    reply:
      'Found 3 options under ₹8k — the Friday evening Indigo hop looks best.',
  },
  {
    id: 'pr',
    label: 'Summarize this PR',
    toolCalls: ['fetch_pull_request(#42)', 'diff_stat()'],
    reply:
      'Adds a Dotty playground, pins dotty-botty 1.0.0, and fakes an agent console.',
  },
  {
    id: 'recipe',
    label: 'Plan a quick pasta dinner',
    toolCalls: ['pantry_scan()', 'recipe_search(cuisine="italian", time=25)'],
    reply: 'Garlic butter spaghetti with chili flakes — 20 minutes, pantry-friendly.',
  },
  {
    id: 'mars',
    label: 'Book a table on Mars',
    toolCalls: ['restaurant_search(planet="mars")'],
    reply: '',
    fail: true,
    errorMessage: 'No restaurants found in that sector. Try Earth instead?',
  },
]

export function scriptForLabel(label: string): AgentScript | null {
  return SCRIPTED_PROMPTS.find((s) => s.label === label) ?? null
}

export function resolveScript(prompt: string): AgentScript {
  const match = scriptForLabel(prompt)
  if (match) return match
  return {
    id: 'generic',
    label: prompt,
    toolCalls: ['think_a_bit()'],
    reply: GENERIC_REPLY,
  }
}
