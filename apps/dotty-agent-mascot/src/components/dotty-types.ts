import type { ExpressionName, ShapeName } from 'dotty-botty'

export interface DottyVisualOptions {
  shape: ShapeName
  expression: ExpressionName | null
  size: number
  ink: string
  spot: string
  followPointer: boolean
  reducedMotion: boolean
}

export const COLOR_PRESETS = [
  { id: 'sunset', label: 'Sunset', ink: '#ff6b1a', spot: '#ffffff' },
  { id: 'forest', label: 'Forest', ink: '#3e7d4f', spot: '#f3f1e7' },
  { id: 'grape', label: 'Grape', ink: '#7c5cff', spot: '#ffffff' },
  { id: 'slate', label: 'Slate', ink: '#334155', spot: '#f8fafc' },
] as const
