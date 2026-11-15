import type { CatalogAsset, CatalogKit, CatalogSnapshot } from "./types"

export const CATALOG_SNAPSHOT_PATH = "/catalog-snapshot.json"
export const CATALOG_PIN_SHA = "2232f7df96e44517e4f9b2d08df1081a4a3780e7"
export const CATALOG_PIN_DATE = "2026-11-11T05:23:02Z"

export function filterAssets(
  assets: CatalogAsset[],
  query: string,
  kitId: string | "all",
  typeFilter: string | "all"
): CatalogAsset[] {
  const q = query.trim().toLowerCase()
  return assets.filter((asset) => {
    if (kitId !== "all" && asset.kit !== kitId) return false
    if (typeFilter !== "all" && asset.type !== typeFilter) return false
    if (!q) return true
    return (
      asset.title.toLowerCase().includes(q) ||
      asset.id.toLowerCase().includes(q) ||
      asset.type.toLowerCase().includes(q)
    )
  })
}

export function kitById(kits: CatalogKit[], id: string): CatalogKit | undefined {
  return kits.find((k) => k.id === id)
}

export function assetTypes(assets: CatalogAsset[]): string[] {
  return [...new Set(assets.map((a) => a.type))].sort()
}

export function parseCatalogSnapshot(raw: unknown): CatalogSnapshot {
  const data = raw as CatalogSnapshot
  if (!data?.assets?.length || !data?.kits?.length) {
    throw new Error("Invalid catalog snapshot")
  }
  return data
}

export async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  const res = await fetch(CATALOG_SNAPSHOT_PATH)
  if (!res.ok) throw new Error(`Catalog load failed: ${res.status}`)
  return parseCatalogSnapshot(await res.json())
}

export function thumbnailForMode(
  asset: CatalogAsset,
  networkMode: "offline" | "live"
): string | null {
  if (networkMode === "offline") return null
  return asset.thumbnail
}