import {
  DirectionalLight,
  Light,
  Mesh,
  PointLight,
  SpotLight,
  lightDesc,
  type LightDesc,
} from "@threert/scene"
import type { BuiltThreertScene } from "./build"
import type { SceneDocument } from "./document"

export type UnitReadout = {
  label: string
  physicalValue: string
  threertValue: string
  note: string
}

export function sunLuxReadout(lux: number): UnitReadout {
  return {
    label: "Sun (DirectionalLight)",
    physicalValue: `${lux.toLocaleString()} lx illuminance`,
    threertValue: `new DirectionalLight(0xffffff, ${lux.toLocaleString()}).setSunAngles(…)`,
    note: "@threert/scene stores sun intensity in lux; native ThreeRT path-traces the disk without shadow maps.",
  }
}

export function pointCdReadout(cd: number): UnitReadout {
  return {
    label: "Point light",
    physicalValue: `${cd.toLocaleString()} cd (luminous intensity)`,
    threertValue: `new PointLight(color, ${cd.toLocaleString()})`,
    note: "ThreeRT PointLight intensity is candela, not lumens.",
  }
}

export function spotCdReadout(cd: number): UnitReadout {
  return {
    label: "Spot light",
    physicalValue: `${cd.toLocaleString()} cd along beam axis`,
    threertValue: `new SpotLight(color, ${cd.toLocaleString()}, …)`,
    note: "Cone angle and penumbra shape the beam in both raster and path-traced modes.",
  }
}

export function emissiveNitsReadout(nits: number): UnitReadout {
  return {
    label: "Emissive material",
    physicalValue: `${nits.toLocaleString()} nits (emissiveIntensity)`,
    threertValue: `material.emissiveIntensity = ${nits.toLocaleString()}`,
    note: "Per @threert/scene: emitted luminance = emissive × emissiveIntensity (nits).",
  }
}

function readoutFromLightDesc(desc: LightDesc): UnitReadout | null {
  switch (desc.type) {
    case "directional":
      return sunLuxReadout(desc.intensity)
    case "point":
      return pointCdReadout(desc.intensity)
    case "spot":
      return spotCdReadout(desc.intensity)
    default:
      return null
  }
}

/** Physical readouts from lights in a built ThreeRT scene via `lightDesc()`. */
export function readoutsFromBuiltScene(
  doc: SceneDocument,
  built: BuiltThreertScene
): UnitReadout[] {
  const out: UnitReadout[] = [sunLuxReadout(doc.environment.sun.illuminanceLux)]

  const walk = (o: { children: typeof built.scene.children }) => {
    for (const child of o.children) {
      if ((child as Light).isLight && !(child as Mesh).isMesh) {
        const light = child as DirectionalLight | PointLight | SpotLight
        if (light.type === "DirectionalLight" && light === built.sun) continue
        const r = readoutFromLightDesc(lightDesc(light))
        if (r) out.push(r)
      }
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh
        const nits = mesh.material.emissiveIntensity
        if (nits > 0) out.push(emissiveNitsReadout(nits))
      }
      if (child.children.length) walk(child)
    }
  }
  walk(built.scene)

  return out
}