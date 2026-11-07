import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { StudioCanvas } from "@/features/studio/StudioCanvas"
import { StudioControls } from "@/features/studio/StudioControls"
import {
  DEFAULT_STUDIO_STATE,
  clampStudioState,
  type StudioState,
} from "@/features/studio/state"

export default function App() {
  const [state, setState] = useState<StudioState>(() =>
    clampStudioState(DEFAULT_STUDIO_STATE)
  )
  const [resetCameraToken, setResetCameraToken] = useState(0)

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-col gap-2 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            Bottle Studio Lab
          </h1>
          <Badge variant="secondary" className="text-[10px] uppercase">
            Independent demo
          </Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Local interactive 3D product studio — shape, glass, fill, lighting,
          camera and wordmark. Inspired by{" "}
          <span className="text-foreground">bottle-studio</span> behavior only;
          not upstream code (repository too young for vendoring).
        </p>
      </header>

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <section
          className="order-1 min-h-[min(52vh,520px)] lg:order-none lg:min-h-[520px]"
          aria-label="3D canvas"
        >
          <StudioCanvas state={state} resetCameraToken={resetCameraToken} />
        </section>
        <section
          className="order-2 max-h-[min(70vh,640px)] overflow-y-auto pr-1 lg:order-none"
          aria-label="Studio controls"
        >
          <StudioControls
            state={state}
            onChange={setState}
            onResetCamera={() => setResetCameraToken((t) => t + 1)}
            reducedMotion={reducedMotion}
          />
        </section>
      </div>
    </div>
  )
}
