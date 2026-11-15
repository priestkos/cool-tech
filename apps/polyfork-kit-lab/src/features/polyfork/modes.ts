import type { NetworkMode, PreviewMeshMode } from "./types"

export function meshModesForNetwork(network: NetworkMode): PreviewMeshMode[] {
  if (network === "offline") return ["placeholder", "parametric"]
  return ["placeholder", "glb", "parametric"]
}

export function meshModeLabel(mode: PreviewMeshMode): string {
  switch (mode) {
    case "placeholder":
      return "Offline placeholder"
    case "glb":
      return "Static GLB (CDN)"
    case "parametric":
      return "Parametric createAsset"
    default: {
      const _exhaustive: never = mode
      return _exhaustive
    }
  }
}

export function networkModeLabel(mode: NetworkMode): string {
  return mode === "offline" ? "Offline (snapshot)" : "Live Polyfork CDN"
}