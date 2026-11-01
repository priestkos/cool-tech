import { describe, expect, test } from "bun:test"
import {
  FrameTimeTracker,
  formatBackendLabel,
  formatFrameTime,
  formatSplatCount,
} from "./stats"

describe("stats formatting", () => {
  test("backend labels match getGpuCaps values", () => {
    expect(formatBackendLabel("webgpu")).toBe("WebGPU")
    expect(formatBackendLabel("webgpu-gl")).toBe("WebGL2 fallback (webgpu-gl)")
  })

  test("frame time rolling average and labels", () => {
    const tracker = new FrameTimeTracker(3)
    tracker.tick(0)
    tracker.tick(16)
    tracker.tick(32)
    tracker.tick(48)
    expect(tracker.averageMs).toBeCloseTo(16, 5)
    expect(formatFrameTime(tracker.averageMs)).toEqual({
      msLabel: "16.0 ms",
      fpsLabel: "63 fps",
    })
    expect(formatFrameTime(null)).toEqual({ msLabel: "—", fpsLabel: "—" })
  })

  test("splat count uses grouping", () => {
    expect(formatSplatCount(67390)).toBe("67,390")
    expect(formatSplatCount(null)).toBe("—")
  })
})
