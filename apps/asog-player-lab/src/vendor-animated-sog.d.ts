declare module "@animated-sog/three" {
  export class AsogThreePlayer {
    static load(
      renderer: import("three").WebGLRenderer,
      source: string,
      scene: import("three").Scene,
      options?: {
        getTime?: () => number
        volume?: number
        onProgress?: (progress: number) => void
      },
    ): Promise<AsogThreePlayer>
    destroy(): void
    readonly numSplats: number
    readonly numVisible: number
    readonly duration: number
    readonly time: number
    readonly hasAudio: boolean
    volume: number
    readonly bounds: { min: number[]; max: number[] }
    readonly object: import("three").Object3D
    readonly listener: { context: AudioContext }
    readonly stats: {
      fileBytes: number
      loadMs: number
      decodeMs: number
    }
  }
}

declare module "@animated-sog/decode" {
  export function openAsog(
    source: ArrayBuffer,
    options?: { onProgress?: (p: number) => void },
  ): Promise<{ manifest: { count: number }; header: unknown; reader: { cancel: () => void } }>
  export function decodeAsog(
    source: unknown,
    options?: { audio?: boolean; keep?: string[] },
  ): Promise<{
    count: number
    stats: { fileBytes: number; decodeMs: number }
  }>
}