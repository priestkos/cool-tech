import type { GpuBackend } from "@sparkjsdev/radix"

export type BackendPreference = "auto" | GpuBackend

export function formatBackendLabel(backend: GpuBackend): string {
  switch (backend) {
    case "webgpu":
      return "WebGPU"
    case "webgpu-gl":
      return "WebGL2 fallback (webgpu-gl)"
    default: {
      const _exhaustive: never = backend
      return _exhaustive
    }
  }
}

export function backendPreferenceLabel(preference: BackendPreference): string {
  switch (preference) {
    case "auto":
      return "Auto"
    case "webgpu":
      return "WebGPU"
    case "webgpu-gl":
      return "WebGL2"
    default: {
      const _exhaustive: never = preference
      return _exhaustive
    }
  }
}

export class FrameTimeTracker {
  private readonly windowSize: number
  private samples: number[] = []
  private lastTimestamp: number | null = null

  constructor(windowSize = 30) {
    this.windowSize = windowSize
  }

  reset(): void {
    this.samples = []
    this.lastTimestamp = null
  }

  tick(now: number): void {
    if (this.lastTimestamp !== null) {
      const delta = now - this.lastTimestamp
      this.samples.push(delta)
      if (this.samples.length > this.windowSize) {
        this.samples.shift()
      }
    }
    this.lastTimestamp = now
  }

  get averageMs(): number | null {
    if (this.samples.length === 0) return null
    const sum = this.samples.reduce((a, b) => a + b, 0)
    return sum / this.samples.length
  }
}

export function formatFrameTime(ms: number | null): { msLabel: string; fpsLabel: string } {
  if (ms === null || !Number.isFinite(ms) || ms <= 0) {
    return { msLabel: "—", fpsLabel: "—" }
  }
  const fps = 1000 / ms
  return {
    msLabel: `${ms.toFixed(1)} ms`,
    fpsLabel: `${fps.toFixed(0)} fps`,
  }
}

export function formatSplatCount(count: number | null): string {
  if (count === null) return "—"
  return count.toLocaleString("en-US")
}
