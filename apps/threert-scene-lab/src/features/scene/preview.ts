import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import type { SceneLabFile, SceneLabMesh, ToneMappingMode } from "./schema"
import {
  candelaToSpotIntensity,
  exitanceToEmissiveIntensity,
  hemisphereLuxToIntensity,
  luxToDirectionalIntensity,
  lumensToPointIntensity,
  sunDirectionFromAzimuthElevation,
} from "./physical"

function skyColor(preset: SceneLabFile["environment"]["sky"]["preset"]): number {
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

function meshGeometry(mesh: SceneLabMesh): THREE.BufferGeometry {
  const s = mesh.size ?? [1, 1, 1]
  switch (mesh.geometry) {
    case "box":
      return new THREE.BoxGeometry(s[0], s[1], s[2])
    case "plane":
      return new THREE.PlaneGeometry(s[0], s[1])
    case "sphere":
      return new THREE.SphereGeometry(s[0], 32, 24)
    case "cylinder":
      return new THREE.CylinderGeometry(s[0], s[0], s[1], 32)
    default: {
      const _exhaustive: never = mesh.geometry
      return _exhaustive
    }
  }
}

export type PreviewHandle = {
  loadScene: (file: SceneLabFile) => void
  dispose: () => void
}

export function createScenePreview(canvas: HTMLCanvasElement): PreviewHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 400)
  camera.position.set(14, 9, 16)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.target.set(0, 1.2, 0)
  controls.maxPolarAngle = Math.PI / 2 - 0.02

  const content = new THREE.Group()
  scene.add(content)

  const sun = new THREE.DirectionalLight(0xfff5e8, 1)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.near = 0.5
  sun.shadow.camera.far = 120
  const d = 30
  sun.shadow.camera.left = -d
  sun.shadow.camera.right = d
  sun.shadow.camera.top = d
  sun.shadow.camera.bottom = -d
  scene.add(sun)

  const hemi = new THREE.HemisphereLight(0xc8e0ff, 0x6a5a48, 0.4)
  scene.add(hemi)

  const lightRig = new THREE.Group()
  scene.add(lightRig)

  let raf = 0
  const tick = () => {
    controls.update()
    renderer.render(scene, camera)
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

  const clearContent = () => {
    while (content.children.length > 0) {
      const child = content.children[0]
      content.remove(child)
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose())
        else child.material.dispose()
      }
    }
    while (lightRig.children.length > 0) {
      const child = lightRig.children[0]
      lightRig.remove(child)
      child.removeFromParent()
    }
  }

  const loadScene = (file: SceneLabFile) => {
    clearContent()

    scene.background = new THREE.Color(skyColor(file.environment.sky.preset))
    renderer.toneMapping = toneMapping(file.renderer.toneMapping)
    renderer.toneMappingExposure = file.renderer.exposure

    const dir = sunDirectionFromAzimuthElevation(
      file.environment.sun.azimuthDeg,
      file.environment.sun.elevationDeg
    )
    const sunDist = 40
    sun.position.set(dir[0] * sunDist, dir[1] * sunDist, dir[2] * sunDist)
    sun.intensity = luxToDirectionalIntensity(file.environment.sun.illuminanceLux)
    sun.visible = file.environment.sun.illuminanceLux > 0 && file.environment.sun.elevationDeg > -2

    const hemiLux = file.environment.hemisphereLux ?? 0
    hemi.intensity = hemisphereLuxToIntensity(hemiLux)

    file.meshes.forEach((mesh) => {
      const geo = meshGeometry(mesh)
      const color = new THREE.Color(mesh.material.color)
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: mesh.material.roughness ?? 0.6,
        metalness: mesh.material.metalness ?? 0,
      })
      if (mesh.material.emissive) {
        mat.emissive = new THREE.Color(mesh.material.emissive.color)
        const exit = mesh.material.emissive.exitanceLmPerM2 ?? 0
        mat.emissiveIntensity = exitanceToEmissiveIntensity(exit)
      }
      const obj = new THREE.Mesh(geo, mat)
      obj.position.set(...mesh.position)
      if (mesh.rotation) {
        obj.rotation.set(...mesh.rotation)
      }
      const castShadow = mesh.geometry !== "plane"
      obj.castShadow = castShadow
      obj.receiveShadow = true
      content.add(obj)
    })

    file.lights.forEach((light) => {
      if (light.type === "point") {
        const pl = new THREE.PointLight(0xfff0d8, lumensToPointIntensity(light.luminousFluxLm))
        pl.position.set(...light.position)
        pl.distance = light.distance ?? 0
        pl.castShadow = true
        lightRig.add(pl)
      } else {
        const sl = new THREE.SpotLight(0xfff8ee, candelaToSpotIntensity(light.intensityCd))
        sl.position.set(...light.position)
        const target = light.target ?? [0, 0, 0]
        sl.target.position.set(...target)
        sl.angle = (light.angleDeg * Math.PI) / 180
        sl.penumbra = light.penumbra ?? 0.2
        sl.distance = light.distance ?? 0
        sl.castShadow = true
        lightRig.add(sl)
        lightRig.add(sl.target)
      }
    })
  }

  return {
    loadScene,
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      clearContent()
      renderer.dispose()
      controls.dispose()
    },
  }
}