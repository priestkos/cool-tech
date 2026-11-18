import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MomentTile } from '@/components/moment-tile'
import { RenderMomentStage } from '@/moments/render-moment-stage'
import type { MomentDefinition } from '@/lib/moment-registry'
import type { MomentPhase } from '@/hooks/use-moments-controller'

type OpenMomentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  def: MomentDefinition | null
  phase: MomentPhase
  playing: boolean
  playKey: number
  reduced: boolean
  onPhase: (phase: MomentPhase) => void
  onReplay: () => void
}

export function OpenMomentDialog({
  open,
  onOpenChange,
  def,
  phase,
  playing,
  playKey,
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
          onPhase={onPhase}
          onReplay={onReplay}
          compact={false}
          picture={
            <RenderMomentStage
              def={def}
              phase={phase}
              playing={playing}
              playKey={playKey}
              reduced={reduced}
              large
            />
          }
        />
      </DialogContent>
    </Dialog>
  )
}