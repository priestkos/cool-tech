import * as THREE from "three"
import type { KnobValues } from "./types"
import { placeholderGroupForAsset } from "./placeholders"
import type { CatalogAsset } from "./types"

/** Offline stand-in for CDN `createAsset` — not Polyfork source. */
export function mockCreateAsset(
  asset: CatalogAsset,
  options: KnobValues = {}
): THREE.Group {
  const g = placeholderGroupForAsset(asset, options)
  if (options.season === "winter") {
    const snow = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.08, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xf2f6f8, flatShading: true })
    )
    snow.position.y = 1.35
    g.add(snow)
  }
  if (options.stovepipe === false) {
    g.children.forEach((c) => {
      if (c instanceof THREE.Mesh && c.geometry instanceof THREE.CylinderGeometry) {
        c.visible = false
      }
    })
  }
  g.userData.mockParametric = true
  return g
}