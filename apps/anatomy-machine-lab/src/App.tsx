import { MachineLab } from "@/components/machine-lab"
import { SiteFooter, SiteHeader } from "@/components/site-chrome"
import { getMachines } from "@/machines"
import type { MachineId } from "@/lib/types"
import { resetPlayback } from "@/lib/timeline"
import { useEffect, useMemo, useState } from "react"

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  )
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduced
}

export default function App() {
  const [dark, setDark] = useState(false)
  const [machineId, setMachineId] = useState<MachineId>("clock")
  const reducedMotion = usePrefersReducedMotion()
  const [effectsEnabled, setEffectsEnabled] = useState(() => !reducedMotion)
  const machines = useMemo(() => getMachines(dark), [dark])
  const active = machines.find((m) => m.id === machineId) ?? machines[0]
  const [playback, setPlayback] = useState(() => resetPlayback(active.cycleSeconds))

  const handleMachineChange = (id: MachineId) => {
    setMachineId(id)
    const next = machines.find((m) => m.id === id)
    if (next) setPlayback(resetPlayback(next.cycleSeconds))
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  useEffect(() => {
    if (reducedMotion) setEffectsEnabled(false)
  }, [reducedMotion])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <MachineLab
          machines={machines}
          machineId={machineId}
          onMachineChange={handleMachineChange}
          playback={playback}
          onPlaybackChange={setPlayback}
          onToggleTheme={() => setDark((d) => !d)}
          effectsEnabled={effectsEnabled}
          onEffectsEnabled={setEffectsEnabled}
          reducedMotion={reducedMotion}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
