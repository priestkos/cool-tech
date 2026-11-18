/** Lab JSON v2 — maps to scenes built with `@threert/scene` (physical lux / cd / nits). */
export const SCENE_DOC_VERSION = 2 as const

export type ToneMappingMode = "aces" | "reinhard" | "linear" | "none"
export type SkyPreset = "clear" | "hazy" | "overcast" | "night"

export type Vec3 = [number, number, number]

export type MeshGeometry = "box" | "plane" | "sphere" | "cylinder"

export type SceneMaterial = {
  color: string
  roughness?: number
  metalness?: number
  emissive?: {
    color: string
    /** Emissive luminance scale (nits multiplier) per `@threert/scene` MeshStandardMaterial. */
    intensityNits?: number
  }
}

export type SceneMesh = {
  id: string
  name?: string
  geometry: MeshGeometry
  size?: Vec3
  position: Vec3
  rotation?: Vec3
  material: SceneMaterial
}

export type ScenePointLight = {
  id: string
  type: "point"
  position: Vec3
  /** Luminous intensity in candela (`PointLight.intensity` in @threert/scene). */
  intensityCd: number
  distance?: number
}

export type SceneSpotLight = {
  id: string
  type: "spot"
  position: Vec3
  target?: Vec3
  intensityCd: number
  distance?: number
  angleDeg: number
  penumbra?: number
}

export type SceneLight = ScenePointLight | SceneSpotLight

export type SceneSun = {
  azimuthDeg: number
  elevationDeg: number
  /** Illuminance in lux (`DirectionalLight.intensity`). */
  illuminanceLux: number
}

export type SceneEnvironment = {
  sun: SceneSun
  sky: { preset: SkyPreset }
}

export type ScenePreview = {
  exposure: number
  toneMapping: ToneMappingMode
}

export type SceneCamera = {
  fov: number
  position: Vec3
  lookAt: Vec3
}

export type SceneDocument = {
  version: typeof SCENE_DOC_VERSION
  meta: { name: string; description?: string }
  environment: SceneEnvironment
  preview: ScenePreview
  camera: SceneCamera
  meshes: SceneMesh[]
  lights: SceneLight[]
}

export type ParseSuccess = { ok: true; doc: SceneDocument }
export type ParseFailure = { ok: false; errors: string[] }
export type ParseResult = ParseSuccess | ParseFailure

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function isVec3(v: unknown): v is Vec3 {
  return (
    Array.isArray(v) &&
    v.length === 3 &&
    v.every((n) => typeof n === "number" && Number.isFinite(n))
  )
}

function isString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0
}

function pushIfMissing(errors: string[], path: string, cond: boolean) {
  if (!cond) errors.push(path)
}

export function validateSceneDocument(raw: unknown): ParseResult {
  const errors: string[] = []

  if (!isRecord(raw)) {
    return { ok: false, errors: ["Root must be an object."] }
  }

  pushIfMissing(errors, "version must be 2", raw.version === SCENE_DOC_VERSION)

  if (!isRecord(raw.meta) || !isString(raw.meta.name)) {
    errors.push("meta.name is required")
  }

  if (!isRecord(raw.environment)) {
    errors.push("environment object required")
  } else {
    const env = raw.environment
    if (!isRecord(env.sun)) {
      errors.push("environment.sun required")
    } else {
      const sun = env.sun
      for (const key of ["azimuthDeg", "elevationDeg", "illuminanceLux"] as const) {
        if (typeof sun[key] !== "number" || !Number.isFinite(sun[key])) {
          errors.push(`environment.sun.${key} must be a finite number`)
        }
      }
    }
    if (!isRecord(env.sky) || typeof env.sky.preset !== "string") {
      errors.push("environment.sky.preset required")
    } else {
      const presets: SkyPreset[] = ["clear", "hazy", "overcast", "night"]
      if (!presets.includes(env.sky.preset as SkyPreset)) {
        errors.push(`environment.sky.preset must be one of ${presets.join(", ")}`)
      }
    }
  }

  if (!isRecord(raw.preview)) {
    errors.push("preview object required")
  } else {
    const r = raw.preview
    if (typeof r.exposure !== "number" || !Number.isFinite(r.exposure) || r.exposure <= 0) {
      errors.push("preview.exposure must be a positive number")
    }
    const modes: ToneMappingMode[] = ["aces", "reinhard", "linear", "none"]
    if (!modes.includes(r.toneMapping as ToneMappingMode)) {
      errors.push(`preview.toneMapping must be one of ${modes.join(", ")}`)
    }
  }

  if (!isRecord(raw.camera)) {
    errors.push("camera object required")
  } else {
    const c = raw.camera
    if (typeof c.fov !== "number" || c.fov <= 0) errors.push("camera.fov required")
    if (!isVec3(c.position)) errors.push("camera.position must be [x,y,z]")
    if (!isVec3(c.lookAt)) errors.push("camera.lookAt must be [x,y,z]")
  }

  if (!Array.isArray(raw.meshes)) {
    errors.push("meshes must be an array")
  } else {
    const ids = new Set<string>()
    raw.meshes.forEach((m, i) => {
      if (!isRecord(m)) {
        errors.push(`meshes[${i}] must be an object`)
        return
      }
      if (!isString(m.id)) errors.push(`meshes[${i}].id required`)
      else if (ids.has(m.id)) errors.push(`duplicate mesh id: ${m.id}`)
      else ids.add(m.id)
      const geos: MeshGeometry[] = ["box", "plane", "sphere", "cylinder"]
      if (!geos.includes(m.geometry as MeshGeometry)) {
        errors.push(`meshes[${i}].geometry invalid`)
      }
      if (!isVec3(m.position)) errors.push(`meshes[${i}].position must be [x,y,z]`)
      if (!isRecord(m.material) || !isString(m.material.color)) {
        errors.push(`meshes[${i}].material.color required`)
      }
    })
  }

  if (!Array.isArray(raw.lights)) {
    errors.push("lights must be an array")
  } else {
    const ids = new Set<string>()
    raw.lights.forEach((l, i) => {
      if (!isRecord(l)) {
        errors.push(`lights[${i}] must be an object`)
        return
      }
      if (!isString(l.id)) errors.push(`lights[${i}].id required`)
      else if (ids.has(l.id)) errors.push(`duplicate light id: ${l.id}`)
      else ids.add(l.id)
      if (l.type === "point") {
        if (!isVec3(l.position)) errors.push(`lights[${i}].position required`)
        if (typeof l.intensityCd !== "number" || l.intensityCd < 0) {
          errors.push(`lights[${i}].intensityCd must be non-negative`)
        }
      } else if (l.type === "spot") {
        if (!isVec3(l.position)) errors.push(`lights[${i}].position required`)
        if (typeof l.intensityCd !== "number" || l.intensityCd < 0) {
          errors.push(`lights[${i}].intensityCd must be non-negative`)
        }
        if (typeof l.angleDeg !== "number") errors.push(`lights[${i}].angleDeg required`)
      } else {
        errors.push(`lights[${i}].type must be point or spot`)
      }
    })
  }

  if (errors.length > 0) return { ok: false, errors }

  return { ok: true, doc: raw as SceneDocument }
}

export function parseSceneDocumentJson(text: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON"
    return { ok: false, errors: [`JSON parse error: ${msg}`] }
  }
  return validateSceneDocument(parsed)
}

export function serializeSceneDocument(doc: SceneDocument): string {
  return JSON.stringify(doc, null, 2)
}