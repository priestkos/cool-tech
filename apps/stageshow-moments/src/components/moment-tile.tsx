import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MomentDefinition } from '@/lib/moment-registry'
import type { MomentPhase } from '@/hooks/use-moments-controller'
import { cn } from '@/lib/utils'

type MomentTileProps = {
  def: MomentDefinition
  phase: MomentPhase
  storyStep: number
  animating: boolean
  reduced: boolean
  compact: boolean
  onPhase: (phase: MomentPhase) => void
  onReplay: () => void
  onOpen?: () => void
  picture: ReactNode
}

export function MomentTile({
  def,
  phase,
  onPhase,
  onReplay,
  onOpen,
  picture,
  compact,
}: MomentTileProps) {
  const isStat = def.kind === 'stat'
  return (
    <article
      className={cn(
        'bento-tile',
        def.span === '2x1' && 'bento-tile--hero',
        def.kind === 'stat' && 'bento-tile--stat',
      )}
      data-moment={def.id}
    >
      <div className="bento-copy">
        <h2 className="bento-headline">{def.headline}</h2>
        {def.support ? <p className="bento-support">{def.support}</p> : null}
      </div>
      <div className="bento-picture">{picture}</div>
      {!isStat ? (
        <div className="bento-controls" role="group" aria-label="Before or after">
          <Button
            type="button"
            variant={phase === 'before' ? 'default' : 'outline'}
            size="sm"
            aria-pressed={phase === 'before'}
            onClick={() => onPhase('before')}
          >
            Before
          </Button>
          <Button
            type="button"
            variant={phase === 'after' ? 'default' : 'outline'}
            size="sm"
            aria-pressed={phase === 'after'}
            onClick={() => onPhase('after')}
          >
            After
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onReplay}>
            <RotateCcw className="size-3.5" />
            Replay
          </Button>
          {onOpen ? (
            <Button type="button" variant="ghost" size="sm" onClick={onOpen}>
              Open
            </Button>
          ) : null}
        </div>
      ) : null}
      <span className="sr-only">{compact ? 'Compact layout' : 'Default layout'}</span>
    </article>
  )
}
