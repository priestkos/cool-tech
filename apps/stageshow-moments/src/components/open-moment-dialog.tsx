import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MomentTile } from '@/components/moment-tile'
import { DaylineScene } from '@/moments/dayline-scene'
import { NatterScene } from '@/moments/natter-scene'
import { StatTileScene } from '@/moments/stat-tile-scene'
import { TallypayScene } from '@/moments/tallypay-scene'
import { WaveletScene } from '@/moments/wavelet-scene'
import type { MomentDefinition } from '@/lib/moment-registry'
import type { MomentPhase } from '@/hooks/use-moments-controller'

type OpenMomentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  def: MomentDefinition | null
  phase: MomentPhase
  storyStep: number
  animating: boolean
  reduced: boolean
  onPhase: (phase: MomentPhase) => void
  onReplay: () => void
}

function renderPicture(
  def: MomentDefinition,
  phase: MomentPhase,
  storyStep: number,
  reduced: boolean,
  compact: boolean,
  large?: boolean,
) {
  const showCursor = def.id === 'wavelet' && !reduced
  switch (def.id) {
    case 'wavelet':
      return (
        <WaveletScene
          phase={phase}
          storyStep={storyStep}
          showCursor={showCursor}
          compact={compact}
          large={large}
        />
      )
    case 'dayline':
      return <DaylineScene phase={phase} storyStep={storyStep} compact={compact} />
    case 'tallypay':
      return <TallypayScene phase={phase} storyStep={storyStep} compact={compact} />
    case 'natter':
      return <NatterScene phase={phase} storyStep={storyStep} compact={compact} />
    case 'stat':
      return <StatTileScene />
    default:
      return null
  }
}

export function OpenMomentDialog({
  open,
  onOpenChange,
  def,
  phase,
  storyStep,
  animating,
  reduced,
  onPhase,
  onReplay,
}: OpenMomentDialogProps) {
  if (!def || def.kind === 'stat') return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="open-dialog">
        <DialogHeader>
          <DialogTitle>{def.title}</DialogTitle>
        </DialogHeader>
        <MomentTile
          def={def}
          phase={phase}
          storyStep={storyStep}
          animating={animating}
          reduced={reduced}
          compact={false}
          onPhase={onPhase}
          onReplay={onReplay}
          picture={renderPicture(def, phase, storyStep, reduced, false, true)}
        />
      </DialogContent>
    </Dialog>
  )
}

export { renderPicture }
