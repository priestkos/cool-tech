'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { flash, getAgent, pendingConfirm } from '@/components/panelo/lib/agent'
import { describeAgentStep as describe } from '@/components/panelo/lib/describe-step'

type Block = { type: string; id?: string; name?: string; input?: any; text?: string }
export type AgentStep = { ref: string; action: string; args?: unknown[] }
type Step = AgentStep

export type AgentChatEntry = { role: 'user' | 'assistant'; text: string } | { role: 'step'; text: string; ok: boolean }

// ponytail: a hard stop on tool round trips per request; raise it for long multi-screen tasks.
const MAX_TURNS = 8

/**
 * Chat with an agent that operates the page through ui-sdk's bridge. The model runs on the server
 * (`endpoint`); its snapshot, act and query calls run here, against the components on screen.
 */
export function useAgentChat({ endpoint = '/api/agent', onRun }: { endpoint?: string; onRun?: () => void } = {}) {
    const [entries, setEntries] = useState<AgentChatEntry[]>([])
    const [busy, setBusy] = useState(false)
    const history = useRef<{ role: 'user' | 'assistant'; content: unknown }[]>([])
    const confirm = useSyncExternalStore(pendingConfirm.subscribe, pendingConfirm.get, pendingConfirm.getServer)

    // Components register with the bridge as they mount, so create it with the page.
    useEffect(() => void getAgent(), [])

    const add = (entry: AgentChatEntry) => setEntries((all) => [...all, entry])

    // Runs act steps on the page and logs each one, the same way for the model and for scripted demos.
    async function runSteps(steps: Step[]) {
        const result = await getAgent().act({ steps })
        steps.forEach((step, i) => {
            if (result.error && i > result.error.step) return
            add({ role: 'step', text: describe(step), ok: !result.error || i < result.error.step })
        })
        result.steps.forEach((done) => flash(done.ref))
        return result
    }

    async function runTool(call: Block) {
        const agent = getAgent()
        try {
            if (call.name === 'snapshot') {
                add({ role: 'step', text: 'Read the dashboard', ok: true })
                return JSON.stringify(agent.snapshot())
            }
            if (call.name === 'query') {
                add({ role: 'step', text: `Looked for ${call.input?.text ?? call.input?.within ?? call.input?.kind}`, ok: true })
                return JSON.stringify(await agent.query(call.input))
            }
            if (call.name === 'act') return JSON.stringify(await runSteps(call.input?.steps ?? []))
            return `Unknown tool ${call.name}`
        } catch (error) {
            add({ role: 'step', text: `${call.name} failed`, ok: false })
            return `Error: ${(error as Error).message}`
        }
    }

    async function send(text: string) {
        if (busy || !text.trim()) return
        onRun?.()
        setBusy(true)
        add({ role: 'user', text })
        history.current.push({ role: 'user', content: text })
        try {
            for (let turn = 0; turn < MAX_TURNS; turn++) {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ messages: history.current }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(data.error ?? 'The assistant is unavailable right now.')

                const content: Block[] = data.content
                history.current.push({ role: 'assistant', content })
                content.forEach((block) => block.type === 'text' && block.text?.trim() && add({ role: 'assistant', text: block.text }))

                const calls = content.filter((block) => block.type === 'tool_use')
                if (!calls.length) break
                const results = []
                for (const call of calls) results.push({ type: 'tool_result', tool_use_id: call.id, content: await runTool(call) })
                history.current.push({ role: 'user', content: results })
            }
        } catch (error) {
            // A half-finished turn can't be continued, so the next message starts a fresh conversation.
            history.current = []
            add({ role: 'assistant', text: (error as Error).message })
        } finally {
            setBusy(false)
        }
    }

    /**
     * Plays known steps without calling the model: free, instant and the same every time. Made for
     * suggestion buttons on a public demo, so only typed requests cost a model call.
     */
    async function play({ prompt, steps, reply }: { prompt: string; steps: Step[]; reply: string }) {
        if (busy) return
        onRun?.()
        setBusy(true)
        add({ role: 'user', text: prompt })
        try {
            const result = await runSteps(steps)
            add({ role: 'assistant', text: result.error ? `I stopped there: ${result.error.message}` : reply })
        } catch (error) {
            add({ role: 'assistant', text: (error as Error).message })
        } finally {
            setBusy(false)
        }
    }

    return { entries, busy, send, play, confirm }
}
