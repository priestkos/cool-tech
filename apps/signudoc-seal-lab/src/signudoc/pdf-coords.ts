/**
 * Adapted from SignuDoc (MIT) — pdf-coords.ts @ 23add989
 */
export type NormalizedFieldRect = {
  height: number
  width: number
  x: number
  y: number
}

export type PdfFieldRect = {
  heightPt: number
  widthPt: number
  xPt: number
  yPt: number
}

export function clampNormalizedFieldRect(
  rect: NormalizedFieldRect,
): NormalizedFieldRect {
  const width = clamp(rect.width, 0.000001, 1)
  const height = clamp(rect.height, 0.000001, 1)

  return {
    height,
    width,
    x: clamp(rect.x, 0, 1 - width),
    y: clamp(rect.y, 0, 1 - height),
  }
}

export function placeFieldAtViewportPoint(input: {
  clientX: number
  clientY: number
  fieldHeight: number
  fieldWidth: number
  viewportHeight: number
  viewportWidth: number
}): NormalizedFieldRect {
  const centeredRect = {
    height: input.fieldHeight,
    width: input.fieldWidth,
    x: input.clientX / input.viewportWidth - input.fieldWidth / 2,
    y: input.clientY / input.viewportHeight - input.fieldHeight / 2,
  }

  return clampNormalizedFieldRect(centeredRect)
}

export function normalizedRectToPdfRect(
  rect: NormalizedFieldRect,
  page: { heightPt: number; widthPt: number },
): PdfFieldRect {
  const normalizedRect = clampNormalizedFieldRect(rect)
  const widthPt = normalizedRect.width * page.widthPt
  const heightPt = normalizedRect.height * page.heightPt

  return {
    heightPt,
    widthPt,
    xPt: normalizedRect.x * page.widthPt,
    yPt:
      page.heightPt -
      (normalizedRect.y + normalizedRect.height) * page.heightPt,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}