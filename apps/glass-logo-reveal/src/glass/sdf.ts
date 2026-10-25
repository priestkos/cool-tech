// Ported from glass-icon-reveal (MIT) — https://github.com/zanwei/glass-icon-reveal

import { BOX, TEX } from './constants'
import type { PresetId } from './presets'
import { PRESETS } from './presets'

export interface LogoTextures {
  canvas: HTMLCanvasElement
  sdf: Float32Array
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('This image could not be read.'))
    img.src = src
  })
}

export function svgToUrl(text: string): string {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
  const svg = doc.documentElement
  if (!svg || svg.nodeName.toLowerCase() !== 'svg') {
    throw new Error('This SVG could not be read.')
  }
  let w = parseFloat(svg.getAttribute('width') ?? '')
  let h = parseFloat(svg.getAttribute('height') ?? '')
  const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number)
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
    w = vb[2]
    h = vb[3]
  }
  if (!(w > 0 && h > 0)) {
    w = h = 100
  }
  const s = TEX / Math.max(w, h)
  svg.setAttribute('width', String(Math.round(w * s)))
  svg.setAttribute('height', String(Math.round(h * s)))
  const out = new XMLSerializer().serializeToString(svg).replace(/currentColor/g, '#ffffff')
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(out)}`
}

function fitToTexture(source: CanvasImageSource, sw: number, sh: number): HTMLCanvasElement {
  const tmp = document.createElement('canvas')
  tmp.width = TEX
  tmp.height = TEX
  const tc = tmp.getContext('2d', { willReadFrequently: true })
  if (!tc) throw new Error('Canvas 2D unavailable')
  const s0 = Math.min(TEX / sw, TEX / sh)
  const dx0 = (TEX - sw * s0) / 2
  const dy0 = (TEX - sh * s0) / 2
  tc.drawImage(source, dx0, dy0, sw * s0, sh * s0)
  const d = tc.getImageData(0, 0, TEX, TEX).data

  let opaque = true
  for (let i = 3; i < d.length; i += 4 * 97) {
    if (d[i] < 250) {
      opaque = false
      break
    }
  }
  const key = [d[0], d[1], d[2]]
  const keyAlpha = (r: number, g: number, b: number) =>
    Math.min(1, Math.max(0, (Math.hypot(r - key[0], g - key[1], b - key[2]) / 441 - 0.08) / 0.2))

  let x0 = TEX
  let y0 = TEX
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < TEX; y++) {
    for (let x = 0; x < TEX; x++) {
      const i = (y * TEX + x) * 4
      const a = opaque ? keyAlpha(d[i], d[i + 1], d[i + 2]) * 255 : d[i + 3]
      if (a > 8) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) throw new Error('The image is empty. Use a logo with visible pixels.')
  const bw = x1 - x0 + 1
  const bh = y1 - y0 + 1
  const s = (TEX * BOX) / Math.max(bw, bh)

  const out = document.createElement('canvas')
  out.width = TEX
  out.height = TEX
  const oc = out.getContext('2d', { willReadFrequently: true })
  if (!oc) throw new Error('Canvas 2D unavailable')
  oc.imageSmoothingQuality = 'high'
  const ox = TEX / 2 - (x0 + bw / 2 - dx0) * s
  const oy = TEX / 2 - (y0 + bh / 2 - dy0) * s
  oc.drawImage(source, ox, oy, sw * s0 * s, sh * s0 * s)
  if (opaque) {
    const im = oc.getImageData(0, 0, TEX, TEX)
    const e = im.data
    for (let i = 0; i < e.length; i += 4) {
      e[i + 3] = Math.round(e[i + 3] * keyAlpha(e[i], e[i + 1], e[i + 2]))
    }
    oc.putImageData(im, 0, 0)
  }
  return out
}

function edt1d(
  grid: Float64Array,
  offset: number,
  stride: number,
  f: Float64Array,
  v: Uint16Array,
  z: Float64Array,
) {
  const INF = 1e20
  v[0] = 0
  z[0] = -INF
  z[1] = INF
  f[0] = grid[offset]
  for (let q = 1, k = 0, s = 0; q < TEX; q++) {
    f[q] = grid[offset + q * stride]
    const q2 = q * q
    do {
      const r = v[k]
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2
    } while (s <= z[k] && --k > -1)
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = INF
  }
  for (let q = 0, k = 0; q < TEX; q++) {
    while (z[k + 1] < q) k++
    const r = v[k]
    const qr = q - r
    grid[offset + q * stride] = f[r] + qr * qr
  }
}

function edt(grid: Float64Array, f: Float64Array, v: Uint16Array, z: Float64Array) {
  for (let x = 0; x < TEX; x++) edt1d(grid, x, TEX, f, v, z)
  for (let y = 0; y < TEX; y++) edt1d(grid, y * TEX, 1, f, v, z)
}

export function buildSdf(canvas: HTMLCanvasElement): Float32Array {
  const n = TEX * TEX
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas 2D unavailable')
  const alpha = ctx.getImageData(0, 0, TEX, TEX).data
  const INF = 1e20
  const outer = new Float64Array(n)
  const inner = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const a = alpha[i * 4 + 3] / 255
    if (a >= 1) {
      outer[i] = 0
      inner[i] = INF
    } else if (a <= 0) {
      outer[i] = INF
      inner[i] = 0
    } else {
      const dd = 0.5 - a
      outer[i] = dd > 0 ? dd * dd : 0
      inner[i] = dd < 0 ? dd * dd : 0
    }
  }
  const f = new Float64Array(TEX)
  const z = new Float64Array(TEX + 1)
  const v = new Uint16Array(TEX)
  edt(outer, f, v, z)
  edt(inner, f, v, z)
  const sdf = new Float32Array(n)
  for (let i = 0; i < n; i++) sdf[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / TEX
  return sdf
}

export async function logoFromPreset(presetId: PresetId): Promise<LogoTextures> {
  const img = await loadImage(svgToUrl(PRESETS[presetId].svg))
  const canvas = fitToTexture(img, img.naturalWidth || TEX, img.naturalHeight || TEX)
  return { canvas, sdf: buildSdf(canvas) }
}

export async function logoFromUpload(url: string): Promise<LogoTextures> {
  const img = await loadImage(url)
  const canvas = fitToTexture(img, img.naturalWidth || TEX, img.naturalHeight || TEX)
  return { canvas, sdf: buildSdf(canvas) }
}

export async function logoFromFile(file: File): Promise<LogoTextures> {
  const url = URL.createObjectURL(file)
  try {
    return await logoFromUpload(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}
