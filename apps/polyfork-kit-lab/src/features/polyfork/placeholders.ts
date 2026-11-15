import * as THREE from "three"
import type { CatalogAsset } from "./types"

const TYPE_COLORS: Record<string, number> = {
  building: 0x6b8e6b,
  vehicle: 0x5a7a9a,
  prop: 0xc8a86a,
  nature: 0x4a8c5c,
  character: 0xd4849a,
}

export function placeholderGroupForAsset(
  asset: CatalogAsset,
  knobValues?: Record<string, string | number | boolean>
): THREE.Group {
  const group = new THREE.Group()
  const color =
    typeof knobValues?.roof === "string" && knobValues.roof.startsWith("#")
      ? new THREE.Color(knobValues.roof as string)
      : new THREE.Color(TYPE_COLORS[asset.type] ?? 0x8899aa)

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.2 + (asset.triangles % 7) * 0.05, 2.4),
    new THREE.MeshStandardMaterial({ color, flatShading: true })
  )
  body.position.y = 0.6
  group.add(body)

  if (asset.type === "building") {
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 0.8, 4),
      new THREE.MeshStandardMaterial({
        color: 0x334433,
        flatShading: true,
      })
    )
    roof.position.y = 1.5
    roof.rotation.y = Math.PI / 4
    group.add(roof)
  }

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  )
  base.position.y = 0.01
  group.add(base)

  return group
}