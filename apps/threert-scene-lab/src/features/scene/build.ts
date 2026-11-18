import {
  BoxGeometry,
  CylinderGeometry,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SkyAtmosphere,
  SphereGeometry,
  SpotLight,
  Color,
  Object3D,
} from "@threert/scene"
import type { SceneDocument, SceneMesh, Vec3 } from "./document"

export type LabGeometryMeta = {
  kind: SceneMesh["geometry"]
  size: Vec3
}

export type BuiltThreertScene = {
  scene: Scene
  camera: PerspectiveCamera
  sun: DirectionalLight
}

function meshGeometry(mesh: SceneMesh) {
  const s = mesh.size ?? [1, 1, 1]
  switch (mesh.geometry) {
    case "box":
      return new BoxGeometry(s[0], s[1], s[2])
    case "plane":
      return new PlaneGeometry(s[0], s[1])
    case "sphere":
      return new SphereGeometry(s[0], 32, 24)
    case "cylinder":
      return new CylinderGeometry(s[0], s[0], s[1], 32)
    default: {
      const _exhaustive: never = mesh.geometry
      return _exhaustive
    }
  }
}

function addMesh(scene: Scene, mesh: SceneMesh) {
  const geo = meshGeometry(mesh)
  const mat = new MeshStandardMaterial({
    color: new Color(mesh.material.color),
    roughness: mesh.material.roughness ?? 0.6,
    metalness: mesh.material.metalness ?? 0,
  })
  if (mesh.material.emissive) {
    mat.emissive = new Color(mesh.material.emissive.color)
    mat.emissiveIntensity = mesh.material.emissive.intensityNits ?? 0
  }
  const obj = new Mesh(geo, mat)
  obj.name = mesh.name ?? mesh.id
  obj.id = mesh.id
  obj.position.set(...mesh.position)
  if (mesh.rotation) obj.rotation.set(...mesh.rotation)
  obj.castShadow = mesh.geometry !== "plane"
  obj.receiveShadow = true
  obj.userData.labGeo = {
    kind: mesh.geometry,
    size: mesh.size ?? [1, 1, 1],
  } satisfies LabGeometryMeta
  scene.add(obj)
}

/** Build a ThreeRT scene graph from a lab document (`@threert/scene@0.1.1` API). */
export function buildThreertScene(doc: SceneDocument): BuiltThreertScene {
  const scene = new Scene()
  const sun = new DirectionalLight(0xffffff, doc.environment.sun.illuminanceLux)
  sun.setSunAngles(
    doc.environment.sun.elevationDeg,
    doc.environment.sun.azimuthDeg
  )
  sun.castShadow = true
  scene.add(sun)
  scene.environment = new SkyAtmosphere({ sun })

  doc.meshes.forEach((m) => addMesh(scene, m))

  doc.lights.forEach((light) => {
    if (light.type === "point") {
      const pl = new PointLight(0xfff0d8, light.intensityCd, light.distance ?? 0)
      pl.position.set(...light.position)
      pl.castShadow = true
      scene.add(pl)
    } else {
      const sl = new SpotLight(
        0xfff8ee,
        light.intensityCd,
        light.distance ?? 0,
        (light.angleDeg * Math.PI) / 180,
        light.penumbra ?? 0.2
      )
      sl.position.set(...light.position)
      const target = new Object3D()
      target.position.set(...(light.target ?? [0, 0, 0]))
      sl.target = target
      sl.castShadow = true
      scene.add(sl, target)
    }
  })

  const camera = new PerspectiveCamera(
    doc.camera.fov,
    16 / 9,
    0.05,
    400
  )
  camera.position.set(...doc.camera.position)
  camera.lookAt(...doc.camera.lookAt)
  scene.add(camera)

  return { scene, camera, sun }
}