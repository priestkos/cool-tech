import type { ArtDef } from '@/looseleaf/lib/ink/art/types'
import { arrows } from '@/looseleaf/lib/ink/art/icons/arrows'
import { marks } from '@/looseleaf/lib/ink/art/icons/marks'
import { status } from '@/looseleaf/lib/ink/art/icons/status'
import { layout } from '@/looseleaf/lib/ink/art/icons/layout'
import { files } from '@/looseleaf/lib/ink/art/icons/files'
import { comms } from '@/looseleaf/lib/ink/art/icons/comms'
import { devData } from '@/looseleaf/lib/ink/art/icons/dev-data'
import { textNatureMisc } from '@/looseleaf/lib/ink/art/icons/text-nature-misc'
import { media } from '@/looseleaf/lib/ink/art/icons/media'
import { commerceTime } from '@/looseleaf/lib/ink/art/icons/commerce-time'

export const iconBatches = { arrows, marks, status, layout, files, comms, devData, textNatureMisc, media, commerceTime } as const
export const icons = { ...arrows, ...marks, ...status, ...layout, ...files, ...comms, ...devData, ...textNatureMisc, ...media, ...commerceTime } satisfies Record<string, ArtDef>
export type IconName = keyof typeof icons
export * from '@/looseleaf/lib/ink/art/icons/aliases'
