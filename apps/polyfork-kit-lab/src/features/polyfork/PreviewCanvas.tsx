import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import type { CatalogAsset, KnobValues, LoadTiming, NetworkMode, PreviewMeshMode } from "./types"
import { placeholderGroupForAsset } from "./placeholders"
import { loadGlbRoot } from "./glb-loader"
import { loadParametricModule } from "./parametric-loader"
import { mockCreateAsset } from "./mock-parametric"

type Props = {
  asset: CatalogAsset | null
  networkMode: NetworkMode
  meshMode: PreviewMeshMode
  knobValues: KnobValues
  onTiming: (t: LoadTiming) => void
  onError: (msg: string | null) => void
}

export function PreviewCanvas({
  asset,
  networkMode,
  meshMode,
  knobValues,
  onTiming,
  onError,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    root: THREE.Object3D | null
    raf: number
  } | null>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe8efe8)
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200)
    camera.position.set(4, 3, 5)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    const hemi = new THREE.HemisphereLight(0xffffff, 0x445544, 1.1)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5, 8, 3)
    scene.add(dir)
    const grid = new THREE.GridHelper(12, 24, 0x99aa99, 0xdde8dd)
    scene.add(grid)

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    stateRef.current = {
      renderer,
      scene,
      camera,
      controls,
      root: null,
      raf: 0,
    }

    const tick = () => {
      controls.update()
      renderer.render(scene, camera)
      stateRef.current!.raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(stateRef.current?.raf ?? 0)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
      el.replaceChildren()
      stateRef.current = null
    }
  }, [])

  useEffect(() => {
    const st = stateRef.current
    if (!st || !asset) return

    const disposeRoot = () => {
      if (!st.root) return
      st.scene.remove(st.root)
      st.root.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const m = o.material
          if (Array.isArray(m)) m.forEach((x) => x.dispose())
          else m.dispose()
        }
      })
      st.root = null
    }

    let cancelled = false

    const fit = (obj: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(obj)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      obj.position.sub(center)
      const maxDim = Math.max(size.x, size.y, size.z, 0.01)
      const scale = 2.2 / maxDim
      obj.scale.setScalar(scale)
    }

    const run = async () => {
      onError(null)
      disposeRoot()
      try {
        let obj: THREE.Object3D
        if (meshMode === "placeholder") {
          obj = placeholderGroupForAsset(asset, knobValues)
          onTiming({
            startedAt: performance.now(),
            finishedAt: performance.now(),
            ms: 0,
            label: "placeholder",
          })
        } else if (meshMode === "parametric" && networkMode === "offline") {
          obj = mockCreateAsset(asset, knobValues)
          onTiming({
            startedAt: performance.now(),
            finishedAt: performance.now(),
            ms: 0,
            label: "mock-parametric",
          })
        } else if (meshMode === "glb") {
          const { scene, timing } = await loadGlbRoot(networkMode, asset)
          if (cancelled) return
          obj = scene
          onTiming(timing)
        } else if (meshMode === "parametric") {
          const { createAsset, timing } = await loadParametricModule(
            networkMode,
            asset
          )
          if (cancelled) return
          obj = createAsset(knobValues)
          onTiming(timing)
        } else {
          obj = placeholderGroupForAsset(asset, knobValues)
        }
        fit(obj)
        st.root = obj
        st.scene.add(obj)
      } catch (e) {
        onError(e instanceof Error ? e.message : String(e))
        const fallback = placeholderGroupForAsset(asset, knobValues)
        fit(fallback)
        st.root = fallback
        st.scene.add(fallback)
      }
    }

    void run()
    return () => {
      cancelled = true
      disposeRoot()
    }
  }, [asset, meshMode, networkMode, knobValues, onTiming, onError])

  return (
    <div
      ref={mountRef}
      className="h-full min-h-[280px] w-full overflow-hidden rounded-lg border border-border bg-muted/30"
      role="img"
      aria-label={asset ? `3D preview of ${asset.title}` : "3D preview canvas"}
    />
  )
}
