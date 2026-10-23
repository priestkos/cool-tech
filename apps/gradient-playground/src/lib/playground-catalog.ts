import type { GradientKind } from '@/lib/gradient-engine'
import type { GradientColors } from '@/components/gradient-surface'

export type HeroComponentId =
  | 'mesh-gradient'
  | 'grain-gradient'
  | 'aurora'
  | 'waves'
  | 'radial-glow'
  | 'linear-flow'
  | 'section-fade'

export interface CatalogEntry {
  id: HeroComponentId
  label: string
  kind: GradientKind
  registrySlug: string
  description: string
}

export const HERO_CATALOG: CatalogEntry[] = [
  {
    id: 'mesh-gradient',
    label: 'Mesh',
    kind: 'mesh',
    registrySlug: 'mesh-gradient',
    description: 'Soft colour blobs drifting together.',
  },
  {
    id: 'grain-gradient',
    label: 'Grain',
    kind: 'grain',
    registrySlug: 'grain-gradient',
    description: 'Saturated, grainy long-exposure blend.',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    kind: 'aurora',
    registrySlug: 'aurora',
    description: 'Vertical light curtains over a night sky.',
  },
  {
    id: 'waves',
    label: 'Waves',
    kind: 'waves',
    registrySlug: 'waves',
    description: 'Layered bands rolling past each other.',
  },
  {
    id: 'radial-glow',
    label: 'Radial glow',
    kind: 'radial-glow',
    registrySlug: 'radial-glow',
    description: 'Warm glow rising from the bottom edge.',
  },
  {
    id: 'linear-flow',
    label: 'Linear flow',
    kind: 'linear-flow',
    registrySlug: 'linear-flow',
    description: 'A quiet linear blend with drifting stops.',
  },
  {
    id: 'section-fade',
    label: 'Section fade',
    kind: 'aurora',
    registrySlug: 'section-fade',
    description: 'Live gradient with soft edge fades.',
  },
]

export function catalogById(id: HeroComponentId): CatalogEntry {
  const entry = HERO_CATALOG.find((item) => item.id === id)
  if (!entry) {
    const fallback: HeroComponentId = 'mesh-gradient'
    return HERO_CATALOG.find((item) => item.id === fallback)!
  }
  return entry
}

export function themePalette(): { colors: GradientColors; background: string } {
  return {
    colors: [
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
      'var(--chart-4)',
    ],
    background: 'var(--background)',
  }
}

export interface ControlState {
  speed: number
  grain: number
  blur: number
  scale: number
  warp: number
  color1: string
  color2: string
  color3: string
  color4: string
}

export const DEFAULT_CONTROLS: ControlState = {
  speed: 0.7,
  grain: 0.12,
  blur: 0.45,
  scale: 1,
  warp: 0.4,
  color1: '#8796ee',
  color2: '#ecdcf2',
  color3: '#2e45b7',
  color4: '#ffb36b',
}

export function controlsToGradientProps(
  controls: ControlState,
  useThemeColors: boolean,
) {
  const palette = themePalette()
  const colors: GradientColors = useThemeColors
    ? palette.colors
    : [controls.color1, controls.color2, controls.color3, controls.color4]
  return {
    colors,
    background: palette.background,
    speed: controls.speed,
    grain: controls.grain,
    blur: controls.blur,
    scale: controls.scale,
    warp: controls.warp,
  }
}
