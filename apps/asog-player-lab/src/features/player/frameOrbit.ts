/** Orbit framing used after an Animated SOG clip loads.
 * Half of CAMERA_FOV_DEG matches PerspectiveCamera in useAsogPlayer.
 * Only the target is transformed by the player's matrixWorld; offset stays in world axes.
 */
export const CAMERA_FOV_DEG = 50
export const FRAME_PADDING = 1.25
export const ELEVATION_DEG = 5

export type Vec3 = readonly [number, number, number]

const HALF_FOV_RAD = ((CAMERA_FOV_DEG / 2) * Math.PI) / 180
const ELEVATION_RAD = (ELEVATION_DEG * Math.PI) / 180

export function frameOrbit(min: Vec3, max: Vec3): {
  target: Vec3
  distance: number
  offset: Vec3
} {
  const target: Vec3 = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ]
  const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2])
  const distance = (size / (2 * Math.tan(HALF_FOV_RAD))) * FRAME_PADDING
  const offset: Vec3 = [
    0,
    Math.sin(ELEVATION_RAD) * distance,
    Math.cos(ELEVATION_RAD) * distance,
  ]
  return { target, distance, offset }
}
