import { describe, expect, test } from "bun:test"

import {
  clampNormalizedFieldRect,
  normalizedRectToPdfRect,
  placeFieldAtViewportPoint,
} from "./pdf-coords.ts"

describe("pdf coordinate mapping", () => {
  test("places field at viewport click", () => {
    const rect = placeFieldAtViewportPoint({
      clientX: 200,
      clientY: 100,
      fieldHeight: 0.08,
      fieldWidth: 0.2,
      viewportHeight: 400,
      viewportWidth: 400,
    })
    expect(rect.x).toBeCloseTo(0.4, 2)
    expect(rect.y).toBeCloseTo(0.21, 2)
  })

  test("maps normalized rect to PDF points (bottom-left origin)", () => {
    const pdfRect = normalizedRectToPdfRect(
      { x: 0.1, y: 0.2, width: 0.3, height: 0.1 },
      { widthPt: 600, heightPt: 800 },
    )
    expect(pdfRect.xPt).toBeCloseTo(60, 1)
    expect(pdfRect.widthPt).toBeCloseTo(180, 1)
    expect(pdfRect.yPt).toBeCloseTo(560, 1)
  })

  test("clamps a click at the viewport edges onto the page", () => {
    const atOrigin = placeFieldAtViewportPoint({
      clientX: 0,
      clientY: 0,
      fieldHeight: 0.1,
      fieldWidth: 0.2,
      viewportHeight: 400,
      viewportWidth: 400,
    })
    expect(atOrigin).toEqual({ x: 0, y: 0, width: 0.2, height: 0.1 })

    const atFarEdge = placeFieldAtViewportPoint({
      clientX: 400,
      clientY: 400,
      fieldHeight: 0.1,
      fieldWidth: 0.2,
      viewportHeight: 400,
      viewportWidth: 400,
    })
    expect(atFarEdge.x).toBeCloseTo(0.8, 5)
    expect(atFarEdge.y).toBeCloseTo(0.9, 5)
  })

  test("clamps oversized and negative rects before PDF mapping", () => {
    const clamped = clampNormalizedFieldRect({
      x: -0.4,
      y: 2,
      width: 2,
      height: -1,
    })
    expect(clamped.width).toBe(1)
    expect(clamped.height).toBe(0.000001)
    expect(clamped.x).toBe(0)
    expect(clamped.y).toBeCloseTo(1 - 0.000001, 6)

    const pdfRect = normalizedRectToPdfRect(
      { x: -1, y: -1, width: 0.25, height: 0.1 },
      { widthPt: 200, heightPt: 100 },
    )
    expect(pdfRect.xPt).toBeCloseTo(0, 5)
    expect(pdfRect.yPt).toBeCloseTo(90, 5)
    expect(pdfRect.widthPt).toBeCloseTo(50, 5)
  })
})
