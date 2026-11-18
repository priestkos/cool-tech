import type { MomentDefinition } from '@/lib/moment-registry'
import { DaylineStage } from './dayline-stage'
import { NatterStage } from './natter-stage'
import { StatStage } from './stat-stage'
import { TallypayStage } from './tallypay-stage'
import { WaveletStage } from './wavelet-stage'
import { resolveMomentMode } from './moment-view'

export { resolveMomentMode } from './moment-view'

type Props = {
  def: MomentDefinition
  phase: 'before' | 'after'
  playing: boolean
  playKey: number
  reduced: boolean
  large?: boolean
}

export function RenderMomentStage({ def, phase, playing, playKey, reduced, large }: Props) {
  const mode = resolveMomentMode(phase, playing)
  const forceStill = reduced
  const fill = large

  switch (def.id) {
    case 'wavelet':
      return <WaveletStage mode={mode} playKey={playKey} forceStill={forceStill} fill={fill} />
    case 'dayline':
      return <DaylineStage mode={mode} playKey={playKey} forceStill={forceStill} fill={fill} />
    case 'tallypay':
      return <TallypayStage mode={mode} playKey={playKey} forceStill={forceStill} fill={fill} />
    case 'natter':
      return <NatterStage mode={mode} playKey={playKey} forceStill={forceStill} fill={fill} />
    case 'stat':
      return <StatStage />
    default:
      return null
  }
}