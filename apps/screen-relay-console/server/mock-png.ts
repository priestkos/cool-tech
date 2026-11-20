import { deflateSync } from "node:zlib"

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }
  return table
})()

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type)
  const length = new Uint8Array(4)
  new DataView(length.buffer).setUint32(0, data.length)
  const body = new Uint8Array(4 + 4 + data.length + 4)
  body.set(length, 0)
  body.set(typeBytes, 4)
  body.set(data, 8)
  const crc = new Uint8Array(4)
  new DataView(crc.buffer).setUint32(0, crc32(new Uint8Array([...typeBytes, ...data])))
  body.set(crc, 8 + data.length)
  return body
}

/** Minimal RGB PNG for mock screenshots (no external deps). */
export function solidPng(
  width: number,
  height: number,
  rgb: [number, number, number],
  label?: string,
): Uint8Array {
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = new Uint8Array(13)
  const view = new DataView(ihdr.buffer)
  view.setUint32(0, width)
  view.setUint32(4, height)
  ihdr[8] = 8
  ihdr[9] = 2
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const rowSize = 1 + width * 3
  const raw = new Uint8Array(rowSize * height)
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize
    raw[rowStart] = 0
    for (let x = 0; x < width; x++) {
      const o = rowStart + 1 + x * 3
      const mix = label ? (x + y + label.length) % 32 : 0
      raw[o] = Math.min(255, rgb[0] + mix)
      raw[o + 1] = Math.min(255, rgb[1] + mix)
      raw[o + 2] = Math.min(255, rgb[2] + mix)
    }
  }
  const idat = deflateSync(raw)

  const parts = [
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", new Uint8Array(0)),
  ]
  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const p of parts) {
    out.set(p, off)
    off += p.length
  }
  return out
}