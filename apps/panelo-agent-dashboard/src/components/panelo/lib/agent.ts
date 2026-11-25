'use client'

import { createAgent, registerTools } from '@ui-sdk/react/agent'
import { elementOf } from '@ui-sdk/react/observe'

type Agent = ReturnType<typeof createAgent>
type Ask = { text: string; answer: (ok: boolean) => void }

let agent: Agent | undefined
let ask: Ask | null = null
const listeners = new Set<() => void>()

function setAsk(next: Ask | null) {
    ask = next
    listeners.forEach((listener) => listener())
}

/** The step waiting on the person, for `useSyncExternalStore`. */
const pendingConfirm = {
    subscribe: (listener: () => void) => {
        listeners.add(listener)
        return () => void listeners.delete(listener)
    },
    get: () => ask,
    getServer: () => null,
}

/**
 * The page's one agent bridge. Steps on anything marked `data-agent-confirm` wait for the person
 * through `pendingConfirm`; everything else runs. Browser agents (WebMCP) get the same tools and rules.
 */
function getAgent() {
    if (agent) return agent
    agent = createAgent({
        allow: (step, { signal }) =>
            !step.confirm ||
            new Promise<boolean>((resolve) => {
                const answer = (ok: boolean) => {
                    setAsk(null)
                    resolve(ok)
                }
                signal.addEventListener('abort', () => answer(false))
                setAsk({ text: step.confirm!, answer })
            }),
    })
    // The bridge's own `allow` already asks, so WebMCP doesn't ask twice.
    registerTools(agent, { allow: () => true })
    return agent
}

/** Rings the control an agent just used, so the person sees what changed. */
function flash(ref: string) {
    try {
        const el = elementOf(ref)
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        el.animate([{ boxShadow: '0 0 0 3px rgb(99 102 241 / 0.8)' }, { boxShadow: '0 0 0 3px rgb(99 102 241 / 0)' }], { duration: 1400, easing: 'ease-out' })
    } catch {
        // The control left the page, like a dialog that closed after its last step.
    }
}

export { getAgent, pendingConfirm, flash }
