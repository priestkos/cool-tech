import { faceColors, STATES, type FaceState } from "glorpies"
import { Glorpie } from "glorpies/react"
import { Hand, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { RosterAgent } from "@/lib/agent-state-machine"

type AgentRosterProps = {
  agents: RosterAgent[]
  states: Record<string, FaceState>
  selectedId: string
  simulate: boolean
  onSelect: (id: string) => void
  onSimulateChange: (value: boolean) => void
  onPinState: (id: string, state: FaceState) => void
  onPoke: (id: string) => void
}

export function AgentRoster({
  agents,
  states,
  selectedId,
  simulate,
  onSelect,
  onSimulateChange,
  onPinState,
  onPoke,
}: AgentRosterProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-lg">Team roster</CardTitle>
        <div className="flex items-center gap-2">
          <Switch checked={simulate} id="simulate" onCheckedChange={onSimulateChange} />
          <Label htmlFor="simulate" className="text-sm font-normal">
            Simulate task loop
          </Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-[420px] pr-3">
          <ul className="space-y-3">
            {agents.map((agent) => {
              const state = states[agent.id] ?? "idle"
              const palette = faceColors(agent.name)
              const selected = agent.id === selectedId
              return (
                <li key={agent.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(agent.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selected ? "ring-2 ring-ring" : "hover:bg-muted/40"
                    }`}
                    style={{
                      background: `color-mix(in oklab, ${palette.bg} 22%, var(--card) 78%)`,
                      borderColor: `color-mix(in oklab, ${palette.accent} 35%, var(--border) 65%)`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span id={`agent-face-${agent.id}`}>
                        <Glorpie
                          name={agent.name}
                          size={48}
                          state={state}
                          look="auto"
                          pokeable
                          label={`${agent.name}, ${state}`}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{agent.name}</span>
                          <Badge variant="outline">{agent.role}</Badge>
                          <Badge>{state}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">{agent.task}</p>
                        {selected ? (
                          <div className="mt-3 flex flex-wrap items-end gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Manual state</Label>
                              <Select
                                value={state}
                                onValueChange={(value) =>
                                  onPinState(agent.id, value as FaceState)
                                }
                              >
                                <SelectTrigger className="h-8 w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={(event) => {
                                event.stopPropagation()
                                onPoke(agent.id)
                              }}
                            >
                              <Hand className="size-4" /> Poke
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </ScrollArea>
        <p className="text-muted-foreground flex items-start gap-2 text-xs">
          <Sparkles className="mt-0.5 size-3.5 shrink-0" />
          Cards are tinted with each agent&apos;s <code className="text-xs">faceColors</code>{" "}
          palette. Simulation advances idle → thinking → working → waiting or blocked → done.
        </p>
      </CardContent>
    </Card>
  )
}

export function pokeAgentFace(agentId: string) {
  const root = document.getElementById(`agent-face-${agentId}`)
  const canvas = root?.querySelector("canvas")
  canvas?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
}
