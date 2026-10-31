import type { BrandKit } from './brands'
import type { FontFaceInput } from './build-deck'

import geist from '../assets/fonts/Geist-Variable.ttf?inline'
import fragmentMono from '../assets/fonts/FragmentMono-Regular.ttf?inline'
import fraunces from '../assets/fonts/Fraunces-Variable.ttf?inline'
import ibmPlexMono from '../assets/fonts/IBMPlexMono-Regular.ttf?inline'
import inter from '../assets/fonts/Inter-Variable.ttf?inline'
import firaCode from '../assets/fonts/FiraCode-Variable.ttf?inline'

const FONT_INLINE: Record<string, string> = {
  'Geist-Variable.ttf': geist,
  'FragmentMono-Regular.ttf': fragmentMono,
  'Fraunces-Variable.ttf': fraunces,
  'IBMPlexMono-Regular.ttf': ibmPlexMono,
  'Inter-Variable.ttf': inter,
  'FiraCode-Variable.ttf': firaCode,
}

export function fontFacesForKit(kit: BrandKit): FontFaceInput[] {
  const files = [kit.fontFiles.display, kit.fontFiles.mono]
  return files.map((f) => ({
    family: f.family,
    file: f.file,
    weight: f.weight,
    dataUrl: FONT_INLINE[f.file] ?? '',
  }))
}
