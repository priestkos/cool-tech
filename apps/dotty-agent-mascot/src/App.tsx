import { useMemo, useState } from 'react'
import type { ShapeName, StateName } from 'dotty-botty'
import { agentPhaseToDottyState } from '@/lib/agent-script-runner'
import { AgentConsole } from '@/components/agent-console'
import { AppHeader } from '@/components/app-header'
import { ControlsPanel } from '@/components/controls-panel'
import { DottyStage } from '@/components/dotty-stage'
import type { DottyVisualOptions } from '@/components/dotty-types'
import { ShapeGallery } from '@/components/shape-gallery'
import { useAgentConsole } from '@/hooks/use-agent-console'

const defaultOptions: DottyVisualOptions = {
  shape: 'ghost',
  expression: null,
  size: 140,
  ink: '#ff6b1a',
  spot: '#ffffff',
  followPointer: true,
  reducedMotion: false,
}

export default function App() {
  const { state: agentState, onTyping, sendPrompt, noteActivity } =
    useAgentConsole()
  const [consoleDriven, setConsoleDriven] = useState(true)
  const [manualState, setManualState] = useState<StateName>('idle')
  const [options, setOptions] = useState<DottyVisualOptions>(defaultOptions)

  const effectiveState = useMemo(() => {
    if (consoleDriven) {
      return agentPhaseToDottyState(agentState.phase)
    }
    return manualState
  }, [agentState.phase, consoleDriven, manualState])

  const patchOptions = (patch: Partial<DottyVisualOptions>) => {
    setOptions((current) => ({ ...current, ...patch }))
    noteActivity()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
        <AppHeader />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <AgentConsole
            state={agentState}
            onTyping={onTyping}
            onSend={(prompt) => {
              void sendPrompt(prompt)
            }}
          />
          <DottyStage
            state={effectiveState}
            options={options}
            onPoke={noteActivity}
          />
        </div>
        <ControlsPanel
          consoleDriven={consoleDriven}
          onConsoleDrivenChange={setConsoleDriven}
          manualState={manualState}
          onManualStateChange={(value) => {
            setManualState(value)
            noteActivity()
          }}
          effectiveState={effectiveState}
          options={options}
          onOptionsChange={patchOptions}
        />
        <ShapeGallery
          state={effectiveState}
          selectedShape={options.shape}
          options={options}
          onSelectShape={(shape: ShapeName) => patchOptions({ shape })}
        />
        <p className="text-center text-xs text-muted-foreground">
          Dotty is inspired by agent characters like xAI&apos;s Grok bot. This
          demo is independent and not affiliated with xAI.
        </p>
      </div>
    </div>
  )
}
