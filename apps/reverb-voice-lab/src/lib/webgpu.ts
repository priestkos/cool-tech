export type WebGpuSupport =
  | { ok: true; adapterName?: string; shaderF16: boolean }
  | { ok: false; reason: string }

export async function probeWebGpu(): Promise<WebGpuSupport> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return {
      ok: false,
      reason:
        "WebGPU is not available in this browser. Use a recent Chrome, Edge, or Safari 26+ with hardware acceleration enabled.",
    }
  }

  try {
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      return {
        ok: false,
        reason:
          "WebGPU could not obtain a GPU adapter. Enable hardware acceleration or try another browser.",
      }
    }
    const features = adapter.features
    const shaderF16 = features.has("shader-f16")
    const info = adapter.info
    return {
      ok: true,
      adapterName: info.device ?? info.description ?? info.vendor,
      shaderF16,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      reason: `WebGPU initialization failed: ${message}`,
    }
  }
}