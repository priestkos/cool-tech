import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import type {
  DirectionalLight,
  Light,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PointLight,
  SpotLight,
} from "@threert/scene"
import type { BuiltThreertScene, LabGeometryMeta } from "./build"
import type { SceneDocument, ToneMappingMode } from "./document"

/** Map @threert/scene emissive nits into three.js emissiveIntensity for raster preview. */
const NITS_TO_THREE_EMISSIVE = 0.001

function skyColor(preset: SceneDocument["environment"]["sky"]["preset"]): number {
  switch (preset) {
    case "clear":
      return 0xb8d4f0
    case "hazy":
      return 0xc4ccd8
    case "overcast":
      return 0xa8b0ba
    case "night":
      return 0x0a0e18
    default: {
      const _exhaustive: never = preset
      return _exhaustive
    }
  }
}

function toneMapping(mode: ToneMappingMode): THREE.ToneMapping {
  switch (mode) {
    case "aces":
      return THREE.ACESFilmicToneMapping
    case "reinhard":
      return THREE.ReinhardToneMapping
    case "linear":
      return THREE.LinearToneMapping
    case "none":
      return THREE.NoToneMapping
    default: {
      const _exhaustive: never = mode
      return _exhaustive
    }
  }
}

function threeGeometry(meta: LabGeometryMeta): THREE.BufferGeometry {
  const s = meta.size
  switch (meta.kind) {
    case "box":
      return new THREE.BoxGeometry(s[0], s[1], s[2])
    case "plane":
      return new THREE.PlaneGeometry(s[0], s[1])
    case "sphere":
      return new THREE.SphereGeometry(s[0], 32, 24)
    case "cylinder":
      return new THREE.CylinderGeometry(s[0], s[0], s[1], 32)
    default: {
      const _exhaustive: never = meta.kind
      return _exhaustive
    }
  }
}

function isThreertMesh(o: Object3D): o is Mesh {
  return Boolean((o as Mesh).isMesh)
}

function isThreertLight(o: Object3D): o is Light {
  return Boolean((o as Light).isLight)
}

function mirrorNode(src: Object3D, parent: THREE.Object3D) {
  if ((src as PerspectiveCamera).isPerspectiveCamera) {
    return
  }

  if (isThreertMesh(src)) {
    const meta = src.userData.labGeo as LabGeometryMeta | undefined
    const geo = meta ? threeGeometry(meta) : new THREE.BoxGeometry(1, 1, 1)
    const m = src.material
    const mat = new THREE.MeshStandardMaterial({
      color: m.color.getHex(),
      roughness: m.roughness,
      metalness: m.metalness,
      emissive: m.emissive.getHex(),
      emissiveIntensity: Math.max(0, m.emissiveIntensity * NITS_TO_THREE_EMISSIVE),
    })
    const obj = new THREE.Mesh(geo, mat)
    obj.position.set(src.position.x, src.position.y, src.position.z)
    obj.quaternion.set(
      src.quaternion.x,
      src.quaternion.y,
      src.quaternion.z,
      src.quaternion.w
    )
    obj.scale.set(src.scale.x, src.scale.y, src.scale.z)
    obj.rotation.set(src.rotation.x, src.rotation.y, src.rotation.z)
    obj.castShadow = src.castShadow
    obj.receiveShadow = src.receiveShadow
    parent.add(obj)
    return
  }

  if (isThreertLight(src)) {
    if ((src as DirectionalLight).isDirectionalLight) {
      const dl = src as DirectionalLight
      const t = new THREE.DirectionalLight(dl.color.getHex(), dl.intensity)
      t.position.set(dl.position.x, dl.position.y, dl.position.z)
      t.castShadow = true
      t.shadow.mapSize.set(1024, 1024)
      parent.add(t)
      return
    }
    if ((src as PointLight).isPointLight) {
      const pl = src as PointLight
      const t = new THREE.PointLight(pl.color.getHex(), pl.intensity, pl.distance)
      t.position.set(pl.position.x, pl.position.y, pl.position.z)
      t.castShadow = true
      parent.add(t)
      return
    }
    if ((src as SpotLight).isSpotLight) {
      const sl = src as SpotLight
      const t = new THREE.SpotLight(
        sl.color.getHex(),
        sl.intensity,
        sl.distance,
        sl.angle,
        sl.penumbra
      )
      t.position.set(sl.position.x, sl.position.y, sl.position.z)
      const targetObj = sl.target
      if (targetObj) {
        const tgt = new THREE.Object3D()
        tgt.position.set(targetObj.position.x, targetObj.position.y, targetObj.position.z)
        t.target = tgt
        parent.add(tgt)
      }
      t.castShadow = true
      parent.add(t)
    }
    return
  }

  for (const child of src.children) {
    mirrorNode(child, parent)
  }
}

export type PreviewHandle = {
  load: (doc: SceneDocument, built: BuiltThreertScene) => void
  dispose: () => void
}

export function createScenePreview(canvas: HTMLCanvasElement): PreviewHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const threeScene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 400)
  camera.position.set(14, 9, 16)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.target.set(0, 1.2, 0)
  controls.maxPolarAngle = Math.PI / 2 - 0.02

  let raf = 0
  const tick = () => {
    controls.update()
    renderer.render(threeScene, camera)
    raf = requestAnimationFrame(tick)
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const w = Math.max(1, rect.width)
    const h = Math.max(1, rect.height)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas.parentElement ?? canvas)
  resize()
  tick()

  const clearThree = () => {
    while (threeScene.children.length > 0) {
      const child = threeScene.children[0]
      threeScene.remove(child)
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose())
        else child.material.dispose()
      }
    }
  }

  return {
    load(doc, built) {
      clearThree()
      threeScene.background = new THREE.Color(skyColor(doc.environment.sky.preset))
      renderer.toneMapping = toneMapping(doc.preview.toneMapping)
      renderer.toneMappingExposure = doc.preview.exposure

      for (const child of built.scene.children) {
        mirrorNode(child, threeScene)
      }

      camera.fov = built.camera.fov
      camera.position.set(
        built.camera.position.x,
        built.camera.position.y,
        built.camera.position.z
      )
      controls.target.set(...doc.camera.lookAt)
      camera.updateProjectionMatrix()
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      clearThree()
      renderer.dispose()
      controls.dispose()
    },
  }
}