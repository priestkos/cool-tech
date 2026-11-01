import {
  CameraControls,
  GpuArrays,
  SplatCollection,
  SplatRenderer,
  createRenderer,
  getGpuCaps,
  loadSplats,
  type GpuBackend,
} from "@sparkjsdev/radix"
import type { CameraControlsMode } from "@sparkjsdev/radix"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import type { WebGPURenderer } from "three/webgpu"
import type { SceneSource } from "@/lib/samples"
import {
  FrameTimeTracker,
  formatBackendLabel,
  formatFrameTime,
  type BackendPreference,
} from "@/lib/stats"

export interface ViewerStatsSnapshot {
  splatCount: number | null
  frameMsLabel: string
  frameFpsLabel: string
  backend: GpuBackend | null
  backendLabel: string
}

export interface SplatViewportProps {
  scene: SceneSource
  backendPreference: BackendPreference
  flipY: boolean
  controlMode: CameraControlsMode
  resetSignal: number
  onStats: (stats: ViewerStatsSnapshot) => void
  onLoading: (state: { active: boolean; message?: string; progress?: number }) => void
  onError: (message: string | null) => void
}

function sceneLoadName(scene: SceneSource): string {
  if (scene.kind === "file") return scene.file.name
  const part = scene.url.split("/").pop()
  return part ?? `${scene.id}.spz`
}

function sceneLoadSource(scene: SceneSource): string | File {
  if (scene.kind === "file") return scene.file
  return scene.url
}

export function SplatViewport({
  scene,
  backendPreference,
  flipY,
  controlMode,
  resetSignal,
  onStats,
  onLoading,
  onError,
}: SplatViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const callbacksRef = useRef({ onStats, onLoading, onError })
  callbacksRef.current = { onStats, onLoading, onError }

  const flipRef = useRef(flipY)
  flipRef.current = flipY
  const modeRef = useRef(controlMode)
  modeRef.current = controlMode

  const runtimeRef = useRef<{
    controls: CameraControls | null
    model: THREE.Object3D | null
    renderer: WebGPURenderer | null
  }>({ controls: null, model: null, renderer: null })

  useEffect(() => {
    runtimeRef.current.controls?.reset()
  }, [resetSignal])

  useEffect(() => {
    const controls = runtimeRef.current.controls
    if (controls) controls.mode = controlMode
  }, [controlMode])

  useEffect(() => {
    const model = runtimeRef.current.model
    if (model) model.rotation.x = flipY ? Math.PI : 0
  }, [flipY])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    const abort = new AbortController()
    let renderer: WebGPURenderer | null = null
    let controls: CameraControls | null = null
    let splatRenderer: SplatRenderer | null = null
    let splatModel: THREE.Object3D | null = null
    let resizeObserver: ResizeObserver | null = null
    const frameTracker = new FrameTimeTracker(30)

    runtimeRef.current = { controls: null, model: null, renderer: null }

    const canvas = document.createElement("canvas")
    canvas.className = "absolute inset-0 h-full w-full touch-none"
    host.appendChild(canvas)

    const scene3 = new THREE.Scene()
    scene3.background = new THREE.Color(0x0a0a0a)
    const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 1000)
    camera.position.set(0, 0.5, 3)

    const pushStats = () => {
      const activeRenderer = runtimeRef.current.renderer
      const frame = formatFrameTime(frameTracker.averageMs)
      const backend = activeRenderer ? getGpuCaps(activeRenderer).backend : null
      callbacksRef.current.onStats({
        splatCount: splatRenderer?.collection.count ?? null,
        frameMsLabel: frame.msLabel,
        frameFpsLabel: frame.fpsLabel,
        backend,
        backendLabel: backend ? formatBackendLabel(backend) : "—",
      })
    }

    const resize = () => {
      if (!renderer) return
      const width = host.clientWidth
      const height = host.clientHeight
      if (width === 0 || height === 0) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const teardownSplats = () => {
      if (splatRenderer) {
        scene3.remove(splatRenderer)
        splatRenderer.dispose()
        splatRenderer = null
      }
      if (splatModel) {
        scene3.remove(splatModel)
        splatModel = null
        runtimeRef.current.model = null
      }
    }

    async function loadSceneIntoRenderer(activeRenderer: WebGPURenderer) {
      teardownSplats()
      callbacksRef.current.onLoading({ active: true, message: "Decoding splats…", progress: 0 })
      callbacksRef.current.onError(null)

      try {
        const data = await loadSplats(sceneLoadSource(scene), {
          name: sceneLoadName(scene),
          signal: abort.signal,
          onProgress: (fraction, stage) => {
            callbacksRef.current.onLoading({
              active: true,
              message: stage === "downloading" ? "Downloading splats…" : "Decoding splats…",
              progress: fraction,
            })
          },
        })

        if (disposed || abort.signal.aborted) return

        splatModel = new THREE.Object3D()
        splatModel.rotation.x = flipRef.current ? Math.PI : 0
        scene3.add(splatModel)
        runtimeRef.current.model = splatModel

        const collection = new SplatCollection([
          SplatCollection.arrays(GpuArrays.fromData(activeRenderer, data), {
            matrixWorld: splatModel.matrixWorld,
          }),
        ])

        splatRenderer = new SplatRenderer({ renderer: activeRenderer, collection })
        scene3.add(splatRenderer)
        callbacksRef.current.onLoading({ active: false })
        pushStats()
      } catch (error) {
        if (disposed || abort.signal.aborted) return
        callbacksRef.current.onError(
          error instanceof Error
            ? error.message
            : "Could not load this splat scene. Try another sample or file.",
        )
        callbacksRef.current.onLoading({ active: false })
        pushStats()
      }
    }

    ;(async () => {
      try {
        callbacksRef.current.onLoading({ active: true, message: "Starting renderer…" })
        renderer = await createRenderer({
          canvas,
          backend: backendPreference,
        })
        if (disposed) return

        runtimeRef.current.renderer = renderer
        resize()

        controls = new CameraControls({
          canvas,
          object: camera,
          settings: { mode: modeRef.current },
        })
        runtimeRef.current.controls = controls

        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(host)

        await loadSceneIntoRenderer(renderer)
        if (disposed) return

        renderer.setAnimationLoop((time) => {
          frameTracker.tick(time)
          controls?.update()
          renderer!.render(scene3, camera)
          pushStats()
        })
      } catch (error) {
        if (disposed) return
        callbacksRef.current.onError(
          error instanceof Error ? error.message : "Failed to initialize Radix renderer.",
        )
        callbacksRef.current.onLoading({ active: false })
      }
    })()

    return () => {
      disposed = true
      abort.abort()
      resizeObserver?.disconnect()
      renderer?.setAnimationLoop(null)
      teardownSplats()
      controls?.dispose()
      renderer?.dispose()
      runtimeRef.current = { controls: null, model: null, renderer: null }
      canvas.remove()
    }
  }, [scene, backendPreference])

  return <div ref={hostRef} className="absolute inset-0 bg-neutral-950" />
}
