import { useCallback, useMemo, useRef, useState } from "react"
import type { CameraControlsMode } from "@sparkjsdev/radix"
import { toast } from "sonner"
import { ControlsPanel } from "@/components/controls-panel"
import { ExplorerHeader } from "@/components/explorer-header"
import { LoadingOverlay } from "@/components/loading-overlay"
import { creditForScene, ScenePicker } from "@/components/scene-picker"
import { SplatViewport, type ViewerStatsSnapshot } from "@/components/splat-viewport"
import { StatsPanel } from "@/components/stats-panel"
import { validateSplatFile } from "@/lib/file-validation"
import { catalogScene, DEFAULT_SCENE_ID, type SceneSource } from "@/lib/samples"
import type { BackendPreference } from "@/lib/stats"

const EMPTY_STATS: ViewerStatsSnapshot = {
  splatCount: null,
  frameMsLabel: "—",
  frameFpsLabel: "—",
  backend: null,
  backendLabel: "—",
}

function defaultScene(): SceneSource {
  return catalogScene(DEFAULT_SCENE_ID) ?? { kind: "vendored", id: "sparkling_water", label: "", url: "/samples/sparkling_water.spz", credit: "" }
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [scene, setScene] = useState<SceneSource>(() => defaultScene())
  const [backendPreference, setBackendPreference] = useState<BackendPreference>("auto")
  const [controlMode, setControlMode] = useState<CameraControlsMode>("orbit")
  const [flipY, setFlipY] = useState(true)
  const [resetSignal, setResetSignal] = useState(0)
  const [stats, setStats] = useState<ViewerStatsSnapshot>(EMPTY_STATS)
  const [loading, setLoading] = useState<{
    active: boolean
    message?: string
    progress?: number
  }>({ active: true, message: "Starting…" })
  const [viewportError, setViewportError] = useState<string | null>(null)

  const activeCredit = useMemo(() => creditForScene(scene), [scene])

  const handleCatalogScene = useCallback((id: string) => {
    const picked = catalogScene(id)
    if (!picked) return
    setScene(picked)
  }, [])

  const loadFile = useCallback((file: File) => {
    const result = validateSplatFile(file)
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    setScene({
      kind: "file",
      id: `file:${file.name}:${file.lastModified}`,
      label: file.name,
      file,
    })
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const file = event.dataTransfer.files.item(0)
      if (!file) {
        toast.error("Drop a single .ply or .spz file.")
        return
      }
      loadFile(file)
    },
    [loadFile],
  )

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-neutral-950"
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <SplatViewport
        scene={scene}
        backendPreference={backendPreference}
        flipY={flipY}
        controlMode={controlMode}
        resetSignal={resetSignal}
        onStats={setStats}
        onLoading={setLoading}
        onError={(message) => {
          setViewportError(message)
          if (message) toast.error(message)
        }}
      />

      <LoadingOverlay active={loading.active} message={loading.message} progress={loading.progress} />

      <ExplorerHeader />

      <aside className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-3 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-xs">
        <ScenePicker
          activeSceneId={scene.kind === "file" ? scene.id : scene.id}
          activeCredit={activeCredit}
          onSelectCatalogScene={handleCatalogScene}
          onOpenFile={() => fileInputRef.current?.click()}
        />
        <ControlsPanel
          mode={controlMode}
          onModeChange={setControlMode}
          flipY={flipY}
          onFlipYChange={setFlipY}
          onResetView={() => setResetSignal((n) => n + 1)}
        />
        <StatsPanel
          stats={stats}
          backendPreference={backendPreference}
          onBackendPreference={setBackendPreference}
        />
      </aside>

      {viewportError ? (
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 max-w-sm rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive backdrop-blur-sm sm:bottom-4 sm:right-4">
          {viewportError}
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept=".ply,.spz"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.item(0)
          if (file) loadFile(file)
          event.target.value = ""
        }}
      />
    </div>
  )
}
