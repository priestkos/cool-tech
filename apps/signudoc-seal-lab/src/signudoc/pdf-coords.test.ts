import { describe, expect, test } from "bun:test"

import {
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
})