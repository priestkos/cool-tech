import { useCallback, useEffect, useReducer, useRef } from 'react'
import {
  IDLE_MS,
  type AgentRunnerState,
  initialAgentRunnerState,
  reduceAgentRunner,
  resolveScript,
} from '@/lib/agent-script-runner'

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

export function useAgentConsole() {
  const [state, dispatch] = useReducer(
    reduceAgentRunner,
    undefined,
    initialAgentRunnerState,
  )
  const runAbort = useRef<AbortController | null>(null)
  const idleTimer = useRef<number | null>(null)

  const bumpIdle = useCallback(() => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => {
      dispatch({ type: 'idle_timeout' })
    }, IDLE_MS)
  }, [])

  const noteActivity = useCallback(() => {
    dispatch({ type: 'activity' })
    bumpIdle()
  }, [bumpIdle])

  useEffect(() => {
    bumpIdle()
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current)
    }
  }, [bumpIdle])

  const cancelRun = useCallback(() => {
    runAbort.current?.abort()
    runAbort.current = null
  }, [])

  const runScript = useCallback(
    async (prompt: string) => {
      cancelRun()
      const controller = new AbortController()
      runAbort.current = controller
      const script = resolveScript(prompt)
      dispatch({ type: 'send', prompt, script })
      noteActivity()

      try {
        await sleep(700, controller.signal)
        dispatch({ type: 'thinking_done' })

        if (script.fail) {
          for (const tool of script.toolCalls) {
            dispatch({ type: 'tool_start', tool })
            await sleep(500, controller.signal)
          }
          dispatch({
            type: 'fail',
            message: script.errorMessage ?? 'Something went wrong.',
          })
          noteActivity()
          return
        }

        for (const tool of script.toolCalls) {
          dispatch({ type: 'tool_start', tool })
          await sleep(650, controller.signal)
          dispatch({ type: 'tool_done' })
        }

        const reply = script.reply
        const chunkSize = Math.max(2, Math.floor(reply.length / 12))
        for (let i = 0; i < reply.length; i += chunkSize) {
          dispatch({ type: 'stream_tick', chunk: reply.slice(i, i + chunkSize) })
          await sleep(80, controller.signal)
        }
        dispatch({ type: 'stream_done' })
        await sleep(1200, controller.signal)
        dispatch({ type: 'celebrate_done' })
        noteActivity()
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        throw err
      }
    },
    [cancelRun, noteActivity],
  )

  const onTyping = useCallback(() => {
    dispatch({ type: 'typing' })
    bumpIdle()
  }, [bumpIdle])

  return {
    state,
    onTyping,
    sendPrompt: runScript,
    noteActivity,
  } satisfies {
    state: AgentRunnerState
    onTyping: () => void
    sendPrompt: (prompt: string) => Promise<void>
    noteActivity: () => void
  }
}
