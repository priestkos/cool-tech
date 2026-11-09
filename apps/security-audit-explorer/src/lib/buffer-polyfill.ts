/** Minimal Buffer subset for vendored validator bytecode in browser bundles. */
export function installBufferPolyfill() {
  if (typeof globalThis.Buffer !== "undefined") return

  const encoder = new TextEncoder()

  const BufferPolyfill = {
    byteLength(value: string, encoding?: string) {
      if (encoding && encoding !== "utf8" && encoding !== "utf-8") {
        throw new Error("Only utf-8 byteLength is supported in the browser polyfill")
      }
      return encoder.encode(value).length
    },
    allocUnsafe(size: number) {
      return new Uint8Array(size)
    },
    from(data: Uint8Array) {
      return new Uint8Array(data)
    },
    concat(chunks: Uint8Array[], length?: number) {
      const out = new Uint8Array(length ?? chunks.reduce((sum, c) => sum + c.length, 0))
      let offset = 0
      for (const chunk of chunks) {
        out.set(chunk, offset)
        offset += chunk.length
      }
      return out
    },
  }

  ;(globalThis as unknown as { Buffer: typeof BufferPolyfill }).Buffer = BufferPolyfill
}
