import generated from "./bundle-sizes.generated.json"

export type BundleSizeEntry = {
  label: string
  bytes: number
  kind: "vite-chunk" | "npm-package"
}

export type BundleSizes = {
  pele: BundleSizeEntry
  mermaid: BundleSizeEntry
  measuredAt?: string
}

/** Sizes from the last production build (see `bun run build`). */
export const buildChunkSizes: BundleSizes = generated as BundleSizes

/** Minified entry file sizes from installed packages (fallback / comparison). */
export const publishedPackageSizes: BundleSizes = {
  pele: {
    label: "pele@1.6.0 dist/pele.js",
    bytes: 677_679,
    kind: "npm-package",
  },
  mermaid: {
    label: "mermaid@12.2.0 dist/mermaid.min.js",
    bytes: 5_494_801,
    kind: "npm-package",
  },
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}
