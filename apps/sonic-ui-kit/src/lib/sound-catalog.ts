import type { Recipe } from '@/components/sounds/react-bits-sound'
import bloom from '@/components/sounds/bloom'
import breeze from '@/components/sounds/breeze'
import chime from '@/components/sounds/chime'
import clasp from '@/components/sounds/clasp'
import glide from '@/components/sounds/glide'
import hint from '@/components/sounds/hint'
import pebble from '@/components/sounds/pebble'
import shake from '@/components/sounds/shake'
import unclasp from '@/components/sounds/unclasp'

export type SoundId =
  | 'pebble'
  | 'clasp'
  | 'unclasp'
  | 'glide'
  | 'breeze'
  | 'bloom'
  | 'shake'
  | 'hint'
  | 'chime'

export type ComponentKey = 'button' | 'switch' | 'tabs' | 'dialog' | 'toast'

export const SOUND_CATALOG: Record<
  SoundId,
  { label: string; description: string; recipe: Recipe; file: string }
> = {
  pebble: {
    label: 'Pebble',
    description: 'Soft rounded tap for primary buttons',
    recipe: pebble,
    file: 'pebble.ts',
  },
  clasp: {
    label: 'Clasp',
    description: 'Two-step click for switches on',
    recipe: clasp,
    file: 'clasp.ts',
  },
  unclasp: {
    label: 'Unclasp',
    description: 'Release click for switches off',
    recipe: unclasp,
    file: 'unclasp.ts',
  },
  glide: {
    label: 'Glide',
    description: 'Smooth slide for tab changes',
    recipe: glide,
    file: 'glide.ts',
  },
  breeze: {
    label: 'Breeze',
    description: 'Soft rise for opening dialogs',
    recipe: breeze,
    file: 'breeze.ts',
  },
  bloom: {
    label: 'Bloom',
    description: 'Warm success confirmation',
    recipe: bloom,
    file: 'bloom.ts',
  },
  shake: {
    label: 'Shake',
    description: 'Muted shake for errors',
    recipe: shake,
    file: 'shake.ts',
  },
  hint: {
    label: 'Hint',
    description: 'Neutral tone for tips and info',
    recipe: hint,
    file: 'hint.ts',
  },
  chime: {
    label: 'Chime',
    description: 'Soft bells for notifications',
    recipe: chime,
    file: 'chime.ts',
  },
}

export const DEFAULT_COMPONENT_SOUNDS: Record<ComponentKey, SoundId> = {
  button: 'pebble',
  switch: 'clasp',
  tabs: 'glide',
  dialog: 'breeze',
  toast: 'chime',
}

export const DEFAULT_TOAST_SOUNDS = {
  success: 'bloom' as SoundId,
  error: 'shake' as SoundId,
  info: 'hint' as SoundId,
}
