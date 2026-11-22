declare module "../../vendor/frostwind/src/render.js" {
  export class FrostwoodWorld {
    constructor(canvas: HTMLCanvasElement)
    renderer: { getContext(): WebGLRenderingContext }
    scene: {
      id: string
      tick(time: number, dt: number): void
      dispose(): void
      gen: { POI: { kind: string; x: number; y: number }[]; oasis?: { x: number; y: number } }
      px: number
      py: number
      lastPX: number
      lastPY: number
      camXf: number
      camYf: number
      lifeSession: { clock: { setMinute(m: number): void } }
      lifeRuntime: { dispose(): void; reconcile(px: number, py: number, w: number, h: number): unknown }
      actors: unknown
      rotorClock: null | unknown
    }
    W: number
    H: number
    time: number
    warmth: number
    build(seed: number, w: number, h: number, opt: Record<string, unknown>): Record<string, unknown>
    setLight(az: number, el: number, warm: number): void
    setLantern(on: boolean, intensity: number): void
    ensure(force: boolean): void
    render(dt: number, ui: Record<string, unknown>): void
  }
}

declare module "../../vendor/frostwind/src/biome.js" {
  export const BIOMES: Record<string, { scene: string }>
}

declare module "../../vendor/frostwind/src/scale.js" {
  export const PLAYER_H: number
  export const HUMAN_M: number
  export const PX_PER_M: number
  export const M_PER_PX: number
  export function metresToPx(m: number): number
  export function pxToMetres(p: number): number
}

declare module "../../vendor/frostwind/src/body-deer.js" {
  export const ROE_DEER_LIFE: {
    northBuck: { bodyLengthM: number }
  }
  export function measureDeer(): { silhouetteLength: number }
}