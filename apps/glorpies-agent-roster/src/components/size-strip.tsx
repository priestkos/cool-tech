import type { FaceState } from "glorpies"
import { Glorpie } from "glorpies/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RosterAgent } from "@/lib/agent-state-machine"

const SIZES = [24, 32, 48, 96] as const

type SizeStripProps = {
  agents: RosterAgent[]
  states: Record<string, FaceState>
}

export function SizeStrip({ agents, states }: SizeStripProps) {
  const sample = agents.slice(0, 4)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Size strip</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {SIZES.map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-10 text-xs tabular-nums">{size}px</span>
            <div className="flex flex-wrap gap-2">
              {sample.map((agent) => (
                <Glorpie
                  key={`${size}-${agent.id}`}
                  name={agent.name}
                  size={size}
                  state={states[agent.id] ?? "idle"}
                  look="auto"
                  label={`${agent.name} at ${size}px`}
                />
              ))}
            </div>
          </div>
        ))}
        <p className="text-muted-foreground text-xs">
          Below 72px, glorpies <code>auto</code> look switches to ink for readability.
        </p>
      </CardContent>
    </Card>
  )
}
