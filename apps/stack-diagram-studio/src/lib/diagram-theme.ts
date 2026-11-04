import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Box,
  CircleUser,
  Cloud,
  CreditCard,
  Database,
  HardDrive,
  Layers,
  Lock,
  Mail,
  Monitor,
  Server,
  Sparkles,
} from "lucide-react"
import type { DiagramTheme, DiagramTile, TileCategory } from "./types"

export const USER_TILE: DiagramTile = {
  instanceId: "inst:user",
  catalogId: null,
  label: "User",
  monogram: "Us",
  category: "user",
}

export function categoryIcon(category: TileCategory): LucideIcon {
  switch (category) {
    case "user":
      return CircleUser
    case "client":
      return Monitor
    case "hosting":
      return Cloud
    case "api":
      return Server
    case "database":
      return Database
    case "auth":
      return Lock
    case "payments":
      return CreditCard
    case "storage":
      return HardDrive
    case "queue":
      return Layers
    case "observability":
      return Activity
    case "other":
      return Sparkles
    default: {
      const _never: never = category
      return _never
    }
  }
}

export function categoryFallbackIcon(category: TileCategory): LucideIcon {
  if (category === "other") return Mail
  return Box
}

export interface DiagramPalette {
  bg: string
  text: string
  muted: string
  border: string
  arrow: string
  tileBg: string
  badgeBg: string
  badgeText: string
}

export function paletteForTheme(theme: DiagramTheme): DiagramPalette {
  if (theme === "dark") {
    return {
      bg: "#1a1a1a",
      text: "#f5f5f5",
      muted: "#a3a3a3",
      border: "#404040",
      arrow: "#737373",
      tileBg: "#262626",
      badgeBg: "#404040",
      badgeText: "#fafafa",
    }
  }
  return {
    bg: "#ffffff",
    text: "#171717",
    muted: "#525252",
    border: "#d4d4d4",
    arrow: "#737373",
    tileBg: "#fafafa",
    badgeBg: "#e5e5e5",
    badgeText: "#171717",
  }
}

export function stackSlug(sentence: string): string {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "stack"
}

export function exportFileBase(sentence: string): string {
  return `stack-${stackSlug(sentence)}`
}
