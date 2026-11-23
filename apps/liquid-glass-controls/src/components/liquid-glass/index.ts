// Liquid Glass — dependency-free glass components (React 19 + Tailwind CSS v4).
// Copy the whole `liquid-glass/` folder, or install with the shadcn CLI (see README).
//
//   GlassButton        press   — swells under the pointer, bends the page behind it
//   GlassActionButton  merge   — its arrow is a droplet that melts in when pressed, and stays
//   GlassTabs          travel  — the selection travels as a magnifying lens
//   GlassBadge         flow    — text flows through the glass
//   GlassSlideToConfirm drag  — drag the glass thumb to the end to confirm
//   GlassCard          hold    — a card of glass: holds your content, its rim bends what slides behind
export { GlassButton, type GlassButtonProps, type GlassButtonSize } from './glass-button'
export { GlassActionButton, type GlassActionButtonProps, type GlassActionState } from './glass-action-button'
export { GlassTabs, type GlassTabsProps, type GlassTabOption } from './glass-tabs'
export { GlassBadge, type GlassBadgeProps } from './glass-badge'
export { GlassSlideToConfirm, type GlassSlideToConfirmProps, type GlassSlideState, type GlassSlideSize } from './glass-slide-to-confirm'
export { GlassCard, type GlassCardProps } from './glass-card'
// Building blocks: GlassLens puts the travelling lens on your own tabs (Radix Tabs, a radiogroup).
export { GlassLens, type GlassLensProps } from './glass-lens'
export { GlassLayer, GlassStyles, GLASS_CSS, type GlassLayerProps, type GlassMaterial, type GlassDroplet, type GlassOptics } from './glass-layer'
