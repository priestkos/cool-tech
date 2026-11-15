import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import type { CatalogAsset, LoadTiming, NetworkMode } from "./types"
import { guardedFetch } from "./network"

export async function loadGlbRoot(
  networkMode: NetworkMode,
  asset: CatalogAsset
): Promise<{ scene: import("three").Group; timing: LoadTiming }> {
  const startedAt = performance.now()
  if (networkMode === "offline") {
    throw new Error("GLB preview requires Live Polyfork CDN mode")
  }
  await guardedFetch(networkMode, asset.glb, { method: "HEAD" })
  const loader = new GLTFLoader()
  const gltf = await new Promise<{ scene: import("three").Group }>(
    (resolve, reject) => {
      loader.load(
        asset.glb,
        (g) => resolve(g),
        undefined,
        reject
      )
    }
  )
  const finishedAt = performance.now()
  return {
    scene: gltf.scene,
    timing: {
      startedAt,
      finishedAt,
      ms: Math.round(finishedAt - startedAt),
      label: "glb",
    },
  }
}