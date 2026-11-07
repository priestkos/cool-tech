import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import {
  capYOffset,
  createBottleGlassGeometry,
  createCapGeometry,
  createFillGeometry,
} from "./geometry"
import type { StudioState } from "./state"
import { hexToRgb, lightPresetMultipliers } from "./state"
import { createWordmarkPlane } from "./wordmark"

export type StudioSceneHandle = {
  update: (state: StudioState) => void
  resetCamera: () => void
  dispose: () => void
}

type MeshBundle = {
  glass: THREE.Mesh
  fill: THREE.Mesh
  cap: THREE.Mesh
  wordmark: THREE.Mesh
  glassGeo: THREE.BufferGeometry
  fillGeo: THREE.BufferGeometry
  capGeo: THREE.BufferGeometry
}

export function createStudioScene(
  canvas: HTMLCanvasElement,
  initial: StudioState,
  reducedMotion: boolean
): StudioSceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.02
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf3efe6)
  scene.fog = new THREE.Fog(0xf3efe6, 8, 22)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40)
  camera.position.set(2.8, 1.65, 3.4)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.target.set(0, 1.1, 0)
  controls.minDistance = 2.2
  controls.maxDistance = 7.5
  controls.autoRotate = initial.autoRotate && !reducedMotion
  controls.autoRotateSpeed = 0.65

  const ambient = new THREE.AmbientLight(0xfff8f0, 0.45)
  const key = new THREE.DirectionalLight(0xfff4e8, 1.1)
  key.position.set(3, 5, 2)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  const fill = new THREE.DirectionalLight(0xdde8ff, 0.55)
  fill.position.set(-2.5, 2, -1.5)
  const rim = new THREE.PointLight(0xffe0c8, 0.45, 12)
  rim.position.set(-1.5, 3.5, 2.5)

  scene.add(ambient, key, fill, rim)

  const floorGeo = new THREE.CircleGeometry(3.2, 48)
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xe8e2d6,
    roughness: 0.92,
    metalness: 0.05,
  })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xc8e8f0),
    metalness: 0,
    roughness: 0.08,
    transmission: 0.92,
    thickness: 0.35,
    transparent: true,
    opacity: 0.38,
    ior: 1.45,
    envMapIntensity: 0.35,
  })

  const fillMat = new THREE.MeshStandardMaterial({
    color: 0xe85d4a,
    roughness: 0.35,
    metalness: 0.05,
  })

  const capMat = new THREE.MeshStandardMaterial({
    color: 0x2c2924,
    roughness: 0.42,
    metalness: 0.55,
  })

  const bundle = makeBundle(initial, glassMat, fillMat, capMat)
  scene.add(bundle.glass, bundle.fill, bundle.cap, bundle.wordmark)

  let animationId = 0
  let alive = true
  let current = initial

  const resize = () => {
    const parent = canvas.parentElement
    if (!parent) return
    const w = parent.clientWidth
    const h = parent.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / Math.max(h, 1)
    camera.updateProjectionMatrix()
  }

  const tick = () => {
    if (!alive) return
    animationId = requestAnimationFrame(tick)
    controls.autoRotate = current.autoRotate && !reducedMotion
    controls.update()
    renderer.render(scene, camera)
  }

  resize()
  tick()
  const onResize = () => resize()
  window.addEventListener("resize", onResize)

  const applyState = (state: StudioState) => {
    current = state
    applyLights(state, { ambient, key, fill, rim })
    applyCameraZoom(camera, controls, state.cameraZoom)
    applyMaterials(state, glassMat, fillMat)
    rebuildMeshes(scene, bundle, state, glassMat, fillMat, capMat)
  }

  applyState(initial)

  return {
    update: applyState,
    resetCamera: () => {
      camera.position.set(2.8, 1.65, 3.4)
      controls.target.set(0, 1.1, 0)
      controls.update()
    },
    dispose: () => {
      alive = false
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", onResize)
      controls.dispose()
      disposeBundle(bundle)
      floorGeo.dispose()
      floorMat.dispose()
      glassMat.dispose()
      fillMat.dispose()
      capMat.dispose()
      renderer.dispose()
    },
  }
}

function makeBundle(
  state: StudioState,
  glassMat: THREE.MeshPhysicalMaterial,
  fillMat: THREE.MeshStandardMaterial,
  capMat: THREE.MeshStandardMaterial
): MeshBundle {
  const glassGeo = createBottleGlassGeometry(state)
  const fillGeo = createFillGeometry(state)
  const capGeo = createCapGeometry(state)
  const glass = new THREE.Mesh(glassGeo, glassMat)
  glass.castShadow = true
  const fill = new THREE.Mesh(fillGeo, fillMat)
  const cap = new THREE.Mesh(capGeo, capMat)
  cap.position.y = capYOffset(state)
  cap.castShadow = true
  const bottleRadius = 0.52 * state.bodyWidth
  const wordmark = createWordmarkPlane(
    state.wordmark,
    state.wordmarkScale,
    bottleRadius,
    state.height
  )
  return { glass, fill, cap, wordmark, glassGeo, fillGeo, capGeo }
}

function disposeBundle(bundle: MeshBundle) {
  bundle.glassGeo.dispose()
  bundle.fillGeo.dispose()
  bundle.capGeo.dispose()
  const wmMat = bundle.wordmark.material
  const mats = Array.isArray(wmMat) ? wmMat : [wmMat]
  for (const mat of mats) {
    if (mat instanceof THREE.MeshBasicMaterial && mat.map) {
      mat.map.dispose()
    }
    mat.dispose()
  }
  bundle.wordmark.geometry.dispose()
}

function rebuildMeshes(
  scene: THREE.Scene,
  bundle: MeshBundle,
  state: StudioState,
  glassMat: THREE.MeshPhysicalMaterial,
  fillMat: THREE.MeshStandardMaterial,
  capMat: THREE.MeshStandardMaterial
) {
  scene.remove(bundle.glass, bundle.fill, bundle.cap, bundle.wordmark)
  disposeBundle(bundle)
  const next = makeBundle(state, glassMat, fillMat, capMat)
  Object.assign(bundle, next)
  scene.add(bundle.glass, bundle.fill, bundle.cap, bundle.wordmark)
}

function applyMaterials(
  state: StudioState,
  glassMat: THREE.MeshPhysicalMaterial,
  fillMat: THREE.MeshStandardMaterial
) {
  const g = hexToRgb(state.glassHex)
  glassMat.color.setRGB(g.r, g.g, g.b)
  glassMat.opacity = state.glassOpacity
  glassMat.transmission = 1 - state.glassOpacity * 0.35
  const f = hexToRgb(state.fillHex)
  fillMat.color.setRGB(f.r, f.g, f.b)
}

function applyLights(
  state: StudioState,
  lights: {
    ambient: THREE.AmbientLight
    key: THREE.DirectionalLight
    fill: THREE.DirectionalLight
    rim: THREE.PointLight
  }
) {
  const mult = lightPresetMultipliers(state.lightPreset)
  const intensity = state.lightIntensity
  lights.key.intensity = intensity * mult.key
  lights.fill.intensity = intensity * mult.fill
  lights.ambient.intensity = mult.ambient * (0.65 + intensity * 0.2)
  lights.rim.intensity = intensity * mult.rim

  const az = (state.lightAzimuth * Math.PI) / 180
  const el = (state.lightElevation * Math.PI) / 180
  const dist = 5.5
  lights.key.position.set(
    Math.cos(az) * Math.cos(el) * dist,
    Math.sin(el) * dist + 1,
    Math.sin(az) * Math.cos(el) * dist
  )
}

function applyCameraZoom(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  zoom: number
) {
  camera.zoom = zoom
  camera.updateProjectionMatrix()
  controls.minDistance = 1.8 / zoom
  controls.maxDistance = 8 / zoom
}
