import type { Vec3 } from "./schema"

/** Reference used to map emissive exitance into three.js emissiveIntensity. */
export const EMISSIVE_REFERENCE_LM_PER_M2 = 1000

export type UnitReadout = {
  label: string
  physicalValue: string
  threeJsValue: string
  note: string
}

export function sunDirectionFromAzimuthElevation(
  azimuthDeg: number,
  elevationDeg: number
): Vec3 {
  const az = (azimuthDeg * Math.PI) / 180
  const el = (elevationDeg * Math.PI) / 180
  const cosEl = Math.cos(el)
  const x = cosEl * Math.sin(az)
  const y = Math.sin(el)
  const z = cosEl * Math.cos(az)
  return [x, y, z]
}

/**
 * With physicallyCorrectLights (legacy off), Three.js uses lux for directional lights.
 */
export function luxToDirectionalIntensity(lux: number): number {
  return Math.max(0, lux)
}

export function lumensToPointIntensity(lm: number): number {
  return Math.max(0, lm)
}

export function candelaToSpotIntensity(cd: number): number {
  return Math.max(0, cd)
}

export function exitanceToEmissiveIntensity(exitanceLmPerM2: number): number {
  return Math.max(0, exitanceLmPerM2 / EMISSIVE_REFERENCE_LM_PER_M2)
}

export function hemisphereLuxToIntensity(lux: number): number {
  /** Skylight fill: scale hemispherical lux into a small ambient contribution. */
  return Math.max(0, lux * 0.000_15)
}

export function sunLuxReadout(lux: number): UnitReadout {
  const intensity = luxToDirectionalIntensity(lux)
  return {
    label: "Sun (directional)",
    physicalValue: `${lux.toLocaleString()} lx (illuminance on horizontal surface at solar noon reference)`,
    threeJsValue: `DirectionalLight.intensity = ${intensity.toLocaleString()} (lux, physical units)`,
    note: "Browser path uses shadow-mapped directional light; ThreeRT native path traces sun disk without shadow maps.",
  }
}

export function pointLmReadout(lm: number): UnitReadout {
  return {
    label: "Point light",
    physicalValue: `${lm.toLocaleString()} lm (luminous flux)`,
    threeJsValue: `PointLight.intensity = ${lumensToPointIntensity(lm).toLocaleString()} lm`,
    note: "Inverse-square falloff applies in three.js physical point lights.",
  }
}

export function spotCdReadout(cd: number): UnitReadout {
  return {
    label: "Spot light",
    physicalValue: `${cd.toLocaleString()} cd (luminous intensity along beam axis)`,
    threeJsValue: `SpotLight.intensity = ${candelaToSpotIntensity(cd).toLocaleString()} cd`,
    note: "Cone angle and penumbra shape the beam; intensity is candela in physical mode.",
  }
}

export function emissiveReadout(exitanceLmPerM2: number): UnitReadout {
  const ei = exitanceToEmissiveIntensity(exitanceLmPerM2)
  return {
    label: "Emissive material",
    physicalValue: `${exitanceLmPerM2.toLocaleString()} lm/m² (luminous exitance, lab schema)`,
    threeJsValue: `Material.emissiveIntensity = ${ei.toFixed(3)} (÷ ${EMISSIVE_REFERENCE_LM_PER_M2} reference)`,
    note: "Mesh emits light in three.js; native ThreeRT can treat emissive sources in path space.",
  }
}