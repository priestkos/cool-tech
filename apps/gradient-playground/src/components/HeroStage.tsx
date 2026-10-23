import type { ReactNode } from 'react'
import { Aurora } from '@/components/aurora'
import { GrainGradient } from '@/components/grain-gradient'
import { LinearFlow } from '@/components/linear-flow'
import { MeshGradient } from '@/components/mesh-gradient'
import { RadialGlow } from '@/components/radial-glow'
import { SectionFade } from '@/components/section-fade'
import { Waves } from '@/components/waves'
import type { GradientProps } from '@/components/gradient-surface'
import {
  catalogById,
  type HeroComponentId,
} from '@/lib/playground-catalog'

const heroClass = 'min-h-[min(72vh,640px)] w-full'

function HeroShell({
  children,
  overlay,
}: {
  children: ReactNode
  overlay: ReactNode
}) {
  return (
    <div className="relative isolate w-full overflow-hidden border-b border-border/50">
      {children}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-foreground">
        <div className="flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-border/40 bg-background/55 px-5 py-6 shadow-sm backdrop-blur-md">
          {overlay}
        </div>
      </div>
    </div>
  )
}

export function HeroStage({
  componentId,
  gradientProps,
  overlay,
}: {
  componentId: HeroComponentId
  gradientProps: GradientProps
  overlay: ReactNode
}) {
  const entry = catalogById(componentId)
  const shared = { ...gradientProps, className: heroClass }

  switch (componentId) {
    case 'mesh-gradient':
      return (
        <HeroShell overlay={overlay}>
          <MeshGradient {...shared} />
        </HeroShell>
      )
    case 'grain-gradient':
      return (
        <HeroShell overlay={overlay}>
          <GrainGradient {...shared} />
        </HeroShell>
      )
    case 'aurora':
      return (
        <HeroShell overlay={overlay}>
          <Aurora {...shared} />
        </HeroShell>
      )
    case 'waves':
      return (
        <HeroShell overlay={overlay}>
          <Waves {...shared} />
        </HeroShell>
      )
    case 'radial-glow':
      return (
        <HeroShell overlay={overlay}>
          <RadialGlow {...shared} />
        </HeroShell>
      )
    case 'linear-flow':
      return (
        <HeroShell overlay={overlay}>
          <LinearFlow {...shared} />
        </HeroShell>
      )
    case 'section-fade':
      return (
        <HeroShell overlay={overlay}>
          <SectionFade {...shared} kind={entry.kind} edges="both" />
        </HeroShell>
      )
    default: {
      const _exhaustive: never = componentId
      return _exhaustive
    }
  }
}
