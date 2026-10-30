import { describe, expect, test } from 'bun:test'
import {
  agentPhaseToDottyState,
  initialAgentRunnerState,
  reduceAgentRunner,
  IDLE_MS,
} from './agent-script-runner'

describe('agentPhaseToDottyState', () => {
  test('maps console phases to Dotty states', () => {
    expect(agentPhaseToDottyState('listening')).toBe('listening')
    expect(agentPhaseToDottyState('thinking')).toBe('thinking')
    expect(agentPhaseToDottyState('working')).toBe('working')
    expect(agentPhaseToDottyState('celebrating')).toBe('celebrating')
    expect(agentPhaseToDottyState('alert')).toBe('alert')
    expect(agentPhaseToDottyState('sleeping')).toBe('sleeping')
    expect(agentPhaseToDottyState('idle')).toBe('idle')
  })
})

describe('reduceAgentRunner', () => {
  test('send moves through thinking and tool logs', () => {
    let state = initialAgentRunnerState()
    state = reduceAgentRunner(state, {
      type: 'send',
      prompt: 'Hi',
      script: {
        id: 'x',
        label: 'Hi',
        toolCalls: ['ping()'],
        reply: 'Hello',
      },
    })
    expect(state.phase).toBe('thinking')
    expect(state.log.at(-1)).toEqual({ kind: 'user', text: 'Hi' })

    state = reduceAgentRunner(state, { type: 'thinking_done' })
    expect(state.phase).toBe('working')

    state = reduceAgentRunner(state, { type: 'tool_start', tool: 'ping()' })
    expect(state.log.at(-1)).toEqual({ kind: 'tool', text: 'ping()' })

    state = reduceAgentRunner(state, { type: 'stream_tick', chunk: 'Hel' })
    state = reduceAgentRunner(state, { type: 'stream_tick', chunk: 'lo' })
    state = reduceAgentRunner(state, { type: 'stream_done' })
    expect(state.phase).toBe('celebrating')
    expect(state.log.at(-1)).toEqual({ kind: 'assistant', text: 'Hello' })

    state = reduceAgentRunner(state, { type: 'celebrate_done' })
    expect(state.phase).toBe('idle')
  })

  test('failed script surfaces alert', () => {
    let state = initialAgentRunnerState()
    state = reduceAgentRunner(state, {
      type: 'send',
      prompt: 'oops',
      script: {
        id: 'bad',
        label: 'oops',
        toolCalls: ['explode()'],
        reply: '',
        fail: true,
        errorMessage: 'Kaboom',
      },
    })
    state = reduceAgentRunner(state, { type: 'thinking_done' })
    state = reduceAgentRunner(state, { type: 'fail', message: 'Kaboom' })
    expect(state.phase).toBe('alert')
    expect(agentPhaseToDottyState(state.phase)).toBe('alert')
  })

  test('idle timeout from idle leads to sleeping', () => {
    let state = initialAgentRunnerState()
    expect(state.phase).toBe('idle')
    state = reduceAgentRunner(state, { type: 'idle_timeout' })
    expect(state.phase).toBe('sleeping')
    expect(agentPhaseToDottyState(state.phase)).toBe('sleeping')
  })

  test('typing wakes Dotty to listening', () => {
    let state = { ...initialAgentRunnerState(), phase: 'idle' as const }
    state = reduceAgentRunner(state, { type: 'typing' })
    expect(state.phase).toBe('listening')
  })
})

describe('IDLE_MS', () => {
  test('is about twenty seconds', () => {
    expect(IDLE_MS).toBe(20_000)
  })
})
