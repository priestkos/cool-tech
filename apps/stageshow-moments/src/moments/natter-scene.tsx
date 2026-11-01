import { InitialTile, StageFrame } from '@/components/stage-frame'
import { cn } from '@/lib/utils'

export type NatterSceneProps = {
  phase: 'before' | 'after'
  storyStep: number
  compact?: boolean
}

export function NatterScene({ phase, storyStep, compact }: NatterSceneProps) {
  const replied = phase === 'after' || storyStep >= 3
  const typing = !replied && storyStep >= 1 && storyStep < 3
  return (
    <StageFrame width={compact ? 280 : 300} compact={compact}>
      <div className="natter">
        <header className="natter-head">
          <InitialTile label="Sam" className="natter-avatar" />
          <div>
            <p className="natter-name">Sam Rivera</p>
            <p className="natter-app">Natter</p>
          </div>
        </header>
        <div className="natter-thread">
          <div className="natter-bubble natter-bubble--in">Can you hop on at 3?</div>
          {typing ? (
            <div className="natter-typing" aria-label="Typing">
              <span />
              <span />
              <span />
            </div>
          ) : null}
          {replied ? (
            <div
              className={cn(
                'natter-bubble natter-bubble--out',
                storyStep >= 3 && 'natter-bubble--land',
              )}
            >
              On my way
              <span className="natter-delivered">Delivered</span>
              <span className="natter-react">👍</span>
            </div>
          ) : null}
        </div>
      </div>
    </StageFrame>
  )
}
