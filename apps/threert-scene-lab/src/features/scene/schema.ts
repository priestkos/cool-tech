export const SCENE_LAB_VERSION = 1 as const

export type ToneMappingMode = "aces" | "reinhard" | "linear" | "none"
export type SkyPreset = "clear" | "hazy" | "overcast" | "night"

export type Vec3 = [number, number, number]

export type MeshGeometry = "box" | "plane" | "sphere" | "cylinder"

export type SceneLabMaterial = {
  color: string
  roughness?: number
  metalness?: number
  emissive?: {
    color: string
    /** Luminous exitance (lm/m²) for emissive surfaces in this lab schema. */
    exitanceLmPerM2?: number
  }
}

export type SceneLabMesh = {
  id: string
  name?: string
  geometry: MeshGeometry
  /** box: [w,h,d]; plane: [w,d]; sphere: [radius]; cylinder: [radius,height] */
  size?: Vec3
  position: Vec3
  rotation?: Vec3
  material: SceneLabMaterial
}

export type SceneLabPointLight = {
  id: string
  type: "point"
  position: Vec3
  luminousFluxLm: number
  distance?: number
}

export type SceneLabSpotLight = {
  id: string
  type: "spot"
  position: Vec3
  target?: Vec3
  intensityCd: number
  distance?: number
  angleDeg: number
  penumbra?: number
}

export type SceneLabLight = SceneLabPointLight | SceneLabSpotLight

export type SceneLabSun = {
  azimuthDeg: number
  elevationDeg: number
  illuminanceLux: number
}

export type SceneLabEnvironment = {
  sun: SceneLabSun
  sky: { preset: SkyPreset }
  /** Diffuse skylight illuminance on a horizontal surface (lx). */
  hemisphereLux?: number
}

export type SceneLabRenderer = {
  exposure: number
  toneMapping: ToneMappingMode
}

export type SceneLabFile = {
  version: typeof SCENE_LAB_VERSION
  meta: { name: string; description?: string }
  environment: SceneLabEnvironment
  renderer: SceneLabRenderer
  meshes: SceneLabMesh[]
  lights: SceneLabLight[]
}

export type ParseSuccess = { ok: true; scene: SceneLabFile }
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

export function validateSceneLabJson(raw: unknown): ParseResult {
  const errors: string[] = []

  if (!isRecord(raw)) {
    return { ok: false, errors: ["Root must be an object."] }
  }

  pushIfMissing(errors, "version must be 1", raw.version === SCENE_LAB_VERSION)

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
      if (
        typeof sun.elevationDeg === "number" &&
        (sun.elevationDeg < -15 || sun.elevationDeg > 90)
      ) {
        errors.push("environment.sun.elevationDeg should be between -15° and 90°")
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
    if (
      env.hemisphereLux !== undefined &&
      (typeof env.hemisphereLux !== "number" || !Number.isFinite(env.hemisphereLux))
    ) {
      errors.push("environment.hemisphereLux must be a finite number when set")
    }
  }

  if (!isRecord(raw.renderer)) {
    errors.push("renderer object required")
  } else {
    const r = raw.renderer
    if (typeof r.exposure !== "number" || !Number.isFinite(r.exposure) || r.exposure <= 0) {
      errors.push("renderer.exposure must be a positive number")
    }
    const modes: ToneMappingMode[] = ["aces", "reinhard", "linear", "none"]
    if (!modes.includes(r.toneMapping as ToneMappingMode)) {
      errors.push(`renderer.toneMapping must be one of ${modes.join(", ")}`)
    }
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
      if (m.rotation !== undefined && !isVec3(m.rotation)) {
        errors.push(`meshes[${i}].rotation must be [x,y,z] when set`)
      }
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
        if (typeof l.luminousFluxLm !== "number" || l.luminousFluxLm < 0) {
          errors.push(`lights[${i}].luminousFluxLm must be a non-negative number`)
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

  return { ok: true, scene: raw as SceneLabFile }
}

export function parseSceneLabJson(text: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON"
    return { ok: false, errors: [`JSON parse error: ${msg}`] }
  }
  return validateSceneLabJson(parsed)
}

export function serializeSceneLab(scene: SceneLabFile): string {
  return JSON.stringify(scene, null, 2)
}