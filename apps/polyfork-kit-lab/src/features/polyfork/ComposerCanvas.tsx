import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import type { CatalogAsset, ComposerPart } from "./types"
import { placeholderGroupForAsset } from "./placeholders"

type Props = {
  parts: ComposerPart[]
  assetsById: Map<string, CatalogAsset>
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (id: string, x: number, z: number) => void
}

export function ComposerCanvas({
  parts,
  assetsById,
  selectedId,
  onSelect,
  onMove,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    meshes: Map<string, THREE.Group>
    raycaster: THREE.Raycaster
    pointer: THREE.Vector2
    ground: THREE.Plane
    raf: number
  } | null>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe6ece6)
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.set(10, 8, 10)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    el.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    scene.add(new THREE.HemisphereLight(0xffffff, 0x556655, 1))
    const dir = new THREE.DirectionalLight(0xffffff, 0.7)
    dir.position.set(4, 10, 2)
    scene.add(dir)
    scene.add(new THREE.GridHelper(16, 16, 0x88aa88, 0xccdccc))

    const meshes = new Map<string, THREE.Group>()
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

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

    let raf = 0
    const tick = () => {
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    const onPointerDown = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hitList = raycaster.intersectObjects([...meshes.values()], true)
      if (hitList[0]) {
        let node: THREE.Object3D | null = hitList[0].object
        let composerId: string | undefined
        while (node) {
          composerId = node.userData.composerId as string | undefined
          if (composerId) break
          node = node.parent
        }
        if (composerId) onSelect(composerId)
        return
      }
      const hit = new THREE.Vector3()
      if (selectedId && raycaster.ray.intersectPlane(ground, hit)) {
        onMove(selectedId, hit.x, hit.z)
      }
    }
    renderer.domElement.addEventListener("pointerdown", onPointerDown)

    apiRef.current = {
      scene,
      camera,
      renderer,
      controls,
      meshes,
      raycaster,
      pointer,
      ground,
      raf,
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener("pointerdown", onPointerDown)
      controls.dispose()
      meshes.forEach((m) => {
        scene.remove(m)
        m.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose()
            const mat = o.material
            if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
            else mat.dispose()
          }
        })
      })
      renderer.dispose()
      el.replaceChildren()
      apiRef.current = null
    }
  }, [onMove, onSelect, selectedId])

  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    const { scene, meshes } = api
    const ids = new Set(parts.map((p) => p.id))

    for (const [id, mesh] of meshes) {
      if (!ids.has(id)) {
        scene.remove(mesh)
        meshes.delete(id)
      }
    }

    for (const part of parts) {
      const asset = assetsById.get(part.assetId)
      if (!asset) continue
      let mesh = meshes.get(part.id)
      if (!mesh) {
        mesh = placeholderGroupForAsset(asset)
        mesh.userData.composerId = part.id
        meshes.set(part.id, mesh)
        scene.add(mesh)
      }
      mesh.position.set(part.x, 0, part.z)
      mesh.rotation.y = (part.rotationDeg * Math.PI) / 180
      const sel = part.id === selectedId
      mesh.traverse((o) => {
        if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshStandardMaterial) {
          o.material.emissive.setHex(sel ? 0x223322 : 0x000000)
        }
      })
    }
  }, [parts, assetsById, selectedId])

  return (
    <div
      ref={mountRef}
      className="h-full min-h-[320px] w-full rounded-lg border border-border bg-muted/20"
      aria-label="Scene composer grid"
    />
  )
}