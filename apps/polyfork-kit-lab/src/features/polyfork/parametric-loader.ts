import * as THREE from "three"
import type { CatalogAsset, KnobValues, LoadTiming } from "./types"
import { guardedFetch } from "./network"

export type CreateAssetFn = (options?: KnobValues) => THREE.Object3D

/** Ensures dynamic CDN modules can resolve the `three` specifier to our pinned build. */
export function ensureThreeImportMap(): void {
  const id = "polyfork-three-importmap"
  if (document.getElementById(id)) return
  const threeUrl = `${import.meta.env.BASE_URL}three-import.js`
  const script = document.createElement("script")
  script.id = id
  script.type = "importmap"
  script.textContent = JSON.stringify({
    imports: { three: threeUrl },
  })
  document.head.prepend(script)
}

export async function loadParamsSchema(
  networkMode: "offline" | "live",
  assetId: string
): Promise<unknown> {
  const url =
    networkMode === "live"
      ? `https://polyfork.dev/cdn/${assetId}-params.json`
      : `/data/${assetId}-params.json`
  if (networkMode === "offline" && !url.startsWith("/")) {
    throw new Error("Offline params must be local")
  }
  const res =
    networkMode === "live"
      ? await guardedFetch(networkMode, url)
      : await fetch(url)
  if (!res.ok) throw new Error(`Params ${res.status}`)
  return res.json()
}

export async function loadParametricModule(
  networkMode: "offline" | "live",
  asset: CatalogAsset
): Promise<{ createAsset: CreateAssetFn; timing: LoadTiming }> {
  const startedAt = performance.now()
  if (networkMode === "offline") {
    throw new Error("Parametric CDN modules require Live Polyfork CDN mode")
  }
  ensureThreeImportMap()
  assertLiveFetchAllowedUrl(asset.module)
  const mod = (await import(/* @vite-ignore */ asset.module)) as {
    createAsset: CreateAssetFn
  }
  const finishedAt = performance.now()
  return {
    createAsset: mod.createAsset,
    timing: {
      startedAt,
      finishedAt,
      ms: Math.round(finishedAt - startedAt),
      label: "parametric-module",
    },
  }
}

function assertLiveFetchAllowedUrl(url: string): void {
  const host = new URL(url).hostname
  if (!host.endsWith("polyfork.dev")) {
    throw new Error(`Blocked non-polyfork module: ${url}`)
  }
}