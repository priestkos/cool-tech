import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import type { Board } from "./model"

const INCH = 1

export type PlacementPreview = {
  length: number
  width: number
  originX: number
  originZ: number
} | null

export type SceneViewState = {
  boards: Board[]
  selectedId: string | null
  preview: PlacementPreview
}

export type BoardSceneHandle = {
  update: (state: SceneViewState) => void
  resetCamera: () => void
  pickGround: (clientX: number, clientY: number) => { x: number; z: number } | null
  pickBoard: (clientX: number, clientY: number) => string | null
  dispose: () => void
}

export function createBoardScene(
  canvas: HTMLCanvasElement,
  onResize: () => void
): BoardSceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe8efe8)

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500)
  camera.position.set(60, 48, 60)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.target.set(24, 0, 12)
  controls.maxPolarAngle = Math.PI / 2 - 0.05

  const ambient = new THREE.AmbientLight(0xffffff, 0.55)
  const sun = new THREE.DirectionalLight(0xfff4e8, 1.1)
  sun.position.set(40, 70, 30)
  sun.castShadow = true
  sun.shadow.camera.left = -80
  sun.shadow.camera.right = 80
  sun.shadow.camera.top = 80
  sun.shadow.camera.bottom = -80
  scene.add(ambient, sun)

  const grid = new THREE.GridHelper(120, 120, 0x9ab39a, 0xd0ddd0)
  const gridMajors = new THREE.GridHelper(120, 10, 0x6d8b6d, 0xd0ddd0)
  grid.position.y = 0.01
  gridMajors.position.y = 0.02
  scene.add(grid, gridMajors)

  const boardGroup = new THREE.Group()
  scene.add(boardGroup)

  const previewMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.05, 1),
    new THREE.MeshStandardMaterial({
      color: 0x5b8f65,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  )
  previewMesh.visible = false
  scene.add(previewMesh)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ visible: false })
  )
  ground.rotation.x = -Math.PI / 2
  ground.name = "ground"
  scene.add(ground)

  const boardMeshes = new Map<string, THREE.Mesh>()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const w = Math.max(1, rect.width)
    const h = Math.max(1, rect.height)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    onResize()
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas.parentElement ?? canvas)
  resize()

  let frame = 0
  const animate = () => {
    frame = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  const syncBoards = (boards: Board[], selectedId: string | null) => {
    const keep = new Set(boards.map((b) => b.id))
    for (const [id, mesh] of boardMeshes) {
      if (!keep.has(id)) {
        boardGroup.remove(mesh)
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
        boardMeshes.delete(id)
      }
    }

    for (const board of boards) {
      let mesh = boardMeshes.get(board.id)
      if (!mesh) {
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({
            color: 0xc9a66b,
            roughness: 0.78,
            metalness: 0.05,
          })
        )
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.userData.boardId = board.id
        boardMeshes.set(board.id, mesh)
        boardGroup.add(mesh)
      }

      mesh.scale.set(board.length * INCH, board.thickness * INCH, board.width * INCH)
      mesh.position.set(
        (board.originX + board.length / 2) * INCH,
        (board.thickness / 2) * INCH,
        (board.originZ + board.width / 2) * INCH
      )
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (board.id === selectedId) {
        mat.color.setHex(0x8fbc6a)
        mat.emissive.setHex(0x1a331a)
        mat.emissiveIntensity = 0.2
      } else {
        mat.color.setHex(0xc9a66b)
        mat.emissive.setHex(0x000000)
        mat.emissiveIntensity = 0
      }
    }
  }

  const syncPreview = (preview: PlacementPreview) => {
    if (!preview) {
      previewMesh.visible = false
      return
    }
    previewMesh.visible = true
    previewMesh.scale.set(preview.length * INCH, 0.08, preview.width * INCH)
    previewMesh.position.set(
      (preview.originX + preview.length / 2) * INCH,
      0.04,
      (preview.originZ + preview.width / 2) * INCH
    )
  }

  const setPointer = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
  }

  return {
    update(state: SceneViewState) {
      syncBoards(state.boards, state.selectedId)
      syncPreview(state.preview)
    },
    resetCamera() {
      camera.position.set(60, 48, 60)
      controls.target.set(24, 0, 12)
      controls.update()
    },
    pickGround(clientX: number, clientY: number) {
      setPointer(clientX, clientY)
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObject(ground, false)
      if (hits.length === 0) return null
      const p = hits[0].point
      return { x: p.x / INCH, z: p.z / INCH }
    },
    pickBoard(clientX: number, clientY: number) {
      setPointer(clientX, clientY)
      raycaster.setFromCamera(pointer, camera)
      const meshes = [...boardMeshes.values()]
      const hits = raycaster.intersectObjects(meshes, false)
      const first = hits[0]
      if (!first) return null
      return (first.object.userData.boardId as string) ?? null
    },
    dispose() {
      cancelAnimationFrame(frame)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
      boardMeshes.forEach((m) => {
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      })
      previewMesh.geometry.dispose()
      ;(previewMesh.material as THREE.Material).dispose()
      ground.geometry.dispose()
      ;(ground.material as THREE.Material).dispose()
    },
  }
}
