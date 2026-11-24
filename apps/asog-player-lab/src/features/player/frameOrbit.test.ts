import { describe, expect, test } from "bun:test"
import { CAMERA_FOV_DEG, ELEVATION_DEG, FRAME_PADDING, frameOrbit } from "./frameOrbit"

function distanceForSize(size: number) {
  return (size / (2 * Math.tan((CAMERA_FOV_DEG / 2) * Math.PI / 180))) * FRAME_PADDING
}

describe("frameOrbit", () => {
  test("longest axis is X", () => {
    const framed = frameOrbit([0, 0, 0], [4, 1, 2])
    const distance = distanceForSize(4)
    const elevation = (ELEVATION_DEG * Math.PI) / 180
    expect(framed.target).toEqual([2, 0.5, 1])
    expect(framed.distance).toBeCloseTo(distance, 10)
    expect(framed.offset[0]).toBe(0)
    expect(framed.offset[1]).toBeCloseTo(Math.sin(elevation) * distance, 10)
    expect(framed.offset[2]).toBeCloseTo(Math.cos(elevation) * distance, 10)
  })

  test("longest axis is Y", () => {
    const framed = frameOrbit([-1, -5, -1], [1, 5, 1])
    expect(framed.target).toEqual([0, 0, 0])
    expect(framed.distance).toBeCloseTo(distanceForSize(10), 10)
  })

  test("zero volume", () => {
    const framed = frameOrbit([1, 2, 3], [1, 2, 3])
    expect(framed.target).toEqual([1, 2, 3])
    expect(framed.distance).toBe(0)
    expect(framed.offset).toEqual([0, 0, 0])
  })

  test("inverted X documents Math.max, not abs", () => {
    const framed = frameOrbit([4, 0, 0], [0, 1, 1])
    expect(framed.target).toEqual([2, 0.5, 0.5])
    expect(framed.distance).toBeCloseTo(distanceForSize(1), 10)
  })

  test("constants", () => {
    expect(CAMERA_FOV_DEG).toBe(50)
    expect(ELEVATION_DEG).toBe(5)
    expect(FRAME_PADDING).toBe(1.25)
  })
})
