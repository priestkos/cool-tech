import * as THREE from "three"
import type { StudioState } from "./state"

/** Profile points for LatheGeometry: x = radius, y = height (up). */
export function buildBottleProfile(state: StudioState): THREE.Vector2[] {
  const { bodyWidth, shoulder, neckWidth, height } = state
  const bodyR = 0.52 * bodyWidth
  const neckR = bodyR * neckWidth
  const shoulderY = height * (0.52 + shoulder * 0.12)
  const neckTop = height * 0.92
  const lipY = height

  const pts: THREE.Vector2[] = []
  pts.push(new THREE.Vector2(0.001, 0))
  pts.push(new THREE.Vector2(bodyR * 0.88, 0.02))
  pts.push(new THREE.Vector2(bodyR, height * 0.08))
  pts.push(new THREE.Vector2(bodyR, shoulderY - height * 0.06))
  pts.push(new THREE.Vector2(bodyR * (0.55 + shoulder * 0.35), shoulderY))
  pts.push(new THREE.Vector2(neckR * 1.05, shoulderY + height * 0.08))
  pts.push(new THREE.Vector2(neckR, neckTop))
  pts.push(new THREE.Vector2(neckR * 1.12, lipY - height * 0.02))
  pts.push(new THREE.Vector2(neckR * 0.92, lipY))
  return pts
}

export function createBottleGlassGeometry(state: StudioState): THREE.LatheGeometry {
  return new THREE.LatheGeometry(buildBottleProfile(state), 64)
}

export function createFillGeometry(state: StudioState): THREE.LatheGeometry {
  const innerScale = 0.88
  const profile = buildBottleProfile(state).map(
    (p) => new THREE.Vector2(p.x * innerScale, p.y)
  )
  const fillTop = Math.max(0.05, state.fillAmount) * state.height * 0.88
  const clipped = profile.filter((p) => p.y <= fillTop)
  if (clipped.length < 2) {
    clipped.push(new THREE.Vector2(0.001, 0), new THREE.Vector2(0.2, fillTop))
  }
  const last = clipped[clipped.length - 1]
  if (last.y < fillTop) {
    clipped.push(new THREE.Vector2(last.x * 0.95, fillTop))
  }
  return new THREE.LatheGeometry(clipped, 48)
}

export function createCapGeometry(state: StudioState): THREE.CylinderGeometry {
  const neckR = 0.52 * state.bodyWidth * state.neckWidth
  const capH = state.height * 0.07
  return new THREE.CylinderGeometry(neckR * 1.05, neckR * 1.08, capH, 32)
}

export function capYOffset(state: StudioState): number {
  return state.height + state.height * 0.035
}
