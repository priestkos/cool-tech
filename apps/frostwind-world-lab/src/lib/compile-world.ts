// @ts-nocheck — vendored Frostwind ESM sources (MIT)
import { FrostwoodWorld } from "../../vendor/frostwind/src/render.js"
import { BIOMES } from "../../vendor/frostwind/src/biome.js"

export const LAB_BIOMES = [
  { id: "frostwood" as const, biomeId: "boreal", label: "Frostwood (boreal)" },
  { id: "meadow" as const, biomeId: "meadow", label: "Sun Meadow" },
  { id: "swamp" as const, biomeId: "swamp", label: "Green Swamp" },
  { id: "desert" as const, biomeId: "desert", label: "Amber Waste" },
] as const

export type SceneId = (typeof LAB_BIOMES)[number]["id"]

const FRAME_W = 480
const FRAME_H = 270
const PINNED_TIME = 12.5
const CANONICAL_SEED = 20260727

const BUILD_OPTS = {
  density: 0.95,
  snow: 1.15,
  lake: 0.55,
  light: -142,
  fog: 0.85,
  poi: null as string | null,
  wear: [] as string[],
}

const UI_STATE = {
  fog: 0.85,
  quant: true,
  precipitation: true,
  wind: 1,
  shadows: true,
}

export type CompileResult = {
  sceneId: SceneId
  seed: number
  width: number
  height: number
  fingerprint: string
  dataUrl: string
  elapsedMs: number
  distinctColours: number
}

import { fnv1aHex } from "./fingerprint"
export { fnv1aHex }

function readFramebuffer(world: FrostwoodWorld): {
  rgba: Uint8ClampedArray
  w: number
  h: number
  distinct: number
} {
  const gl = world.renderer.getContext() as WebGLRenderingContext
  const w = gl.drawingBufferWidth
  const h = gl.drawingBufferHeight
  const raw = new Uint8Array(w * h * 4)
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, raw)

  const rgba = new Uint8ClampedArray(w * h * 4)
  const hist = new Set<string>()
  for (let y = 0; y < h; y++) {
    const srcRow = (h - 1 - y) * w * 4
    const dstRow = y * w * 4
    for (let x = 0; x < w * 4; x++) {
      const v = raw[srcRow + x]
      rgba[dstRow + x] = v
    }
    for (let x = 0; x < w; x++) {
      const i = srcRow + x * 4
      hist.add(`${raw[i]},${raw[i + 1]},${raw[i + 2]}`)
    }
  }
  return { rgba, w, h, distinct: hist.size }
}

function rgbaToDataUrl(rgba: Uint8ClampedArray, w: number, h: number): string {
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("2d context unavailable")
  const copy = new Uint8ClampedArray(rgba)
  ctx.putImageData(new ImageData(copy, w, h), 0, 0)
  return canvas.toDataURL("image/png")
}

function seatCamera(sceneId: SceneId, W: FrostwoodWorld): void {
  const S = W.scene
  if (!S) return

  if (sceneId === "meadow") {
    const common = S.gen.POI.find((p: { kind: string }) => p.kind === "village")
    if (!common) throw new Error("meadow has no common")
    S.px = common.x
    S.py = common.y
    S.lastPX = common.x
    S.lastPY = common.y
    S.camXf = S.px - W.W / 2
    S.camYf = S.py - W.H * 0.56
    W.ensure(true)
  } else if (sceneId === "swamp") {
    const landing = S.gen.POI.find((p: { kind: string }) => p.kind === "swampSettlement")
    if (!landing) throw new Error("swamp has no settlement landing")
    S.px = landing.x
    S.py = landing.y
    S.lastPX = landing.x
    S.lastPY = landing.y
    S.camXf = S.px - W.W / 2
    S.camYf = S.py - W.H * 0.56
    W.ensure(true)
  } else if (sceneId === "desert") {
    const pool = S.gen.oasis
    if (!pool) throw new Error("desert has no oasis")
    S.px = pool.x
    S.py = pool.y
    S.lastPX = pool.x
    S.lastPY = pool.y
    S.camXf = S.px - W.W / 2
    S.camYf = S.py - W.H * 0.56
    W.ensure(true)
  }
}

function pinLifeClock(W: FrostwoodWorld): void {
  const S = W.scene
  S.lifeSession.clock.setMinute(171 * 1440 + 720)
  S.lifeRuntime.dispose()
  S.actors = S.lifeRuntime.reconcile(S.px, S.py, W.W, W.H)
  S.rotorClock = null
}

function assertBiomeMatchesScene(sceneId: SceneId): void {
  const row = LAB_BIOMES.find((b) => b.id === sceneId)
  if (!row) throw new Error(`unknown scene ${sceneId}`)
  const biome = BIOMES[row.biomeId]
  if (!biome || biome.scene !== sceneId) {
    throw new Error(`BIOMES.${row.biomeId} scene mismatch`)
  }
}

export function compileWorldFrame(
  sceneId: SceneId,
  seed: number = CANONICAL_SEED,
  canvas?: HTMLCanvasElement,
): CompileResult {
  assertBiomeMatchesScene(sceneId)

  const view = canvas ?? document.createElement("canvas")
  const t0 = performance.now()
  const world = new FrostwoodWorld(view)

  world.build(seed >>> 0, FRAME_W, FRAME_H, { ...BUILD_OPTS, scene: sceneId })
  world.setLight(218, 40, 0.1)
  world.setLantern(false, 0)

  seatCamera(sceneId, world)
  pinLifeClock(world)

  world.time = PINNED_TIME
  world.scene.tick(PINNED_TIME, 0)
  world.ensure(true)
  world.render(0, UI_STATE)

  const { rgba, w, h, distinct } = readFramebuffer(world)
  if (distinct <= 1) {
    world.scene?.dispose?.()
    throw new Error("compile produced a flat frame — WebGL readback or build failed")
  }

  const fingerprint = fnv1aHex(new Uint8Array(rgba.buffer))
  const dataUrl = rgbaToDataUrl(rgba, w, h)
  const elapsedMs = performance.now() - t0

  world.scene?.dispose?.()

  return {
    sceneId,
    seed: seed >>> 0,
    width: w,
    height: h,
    fingerprint,
    dataUrl,
    elapsedMs,
    distinctColours: distinct,
  }
}

export function hasWebGL(): boolean {
  try {
    const t = document.createElement("canvas")
    return !!(t.getContext("webgl2") || t.getContext("webgl"))
  } catch {
    return false
  }
}