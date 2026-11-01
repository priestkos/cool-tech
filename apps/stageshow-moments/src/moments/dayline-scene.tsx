import { Check } from 'lucide-react'
import { Bar, StageFrame } from '@/components/stage-frame'
import { cn } from '@/lib/utils'

export type DaylineSceneProps = {
  phase: 'before' | 'after'
  storyStep: number
  compact?: boolean
}

export function DaylineScene({ phase, storyStep, compact }: DaylineSceneProps) {
  const accepted = phase === 'after' || storyStep >= 3
  return (
    <StageFrame width={compact ? 280 : 320} compact={compact}>
      <div className="dayline">
        <header className="dayline-head">
          <span className="dayline-brand">Dayline</span>
          <Bar className="w-16" />
        </header>
        <div className="dayline-week">
          {['M', 'T', 'W', 'T', 'F'].map((d) => (
            <span key={d} className="dayline-dow">
              {d}
              <Bar className="w-6 h-2" />
            </span>
          ))}
        </div>
        <div
          className={cn(
            'dayline-invite',
            storyStep >= 1 && 'dayline-invite--lift',
            accepted && 'dayline-invite--accepted',
          )}
        >
          <p className="dayline-event">Design review</p>
          <p className="dayline-time">Thu 2:00</p>
          {!accepted ? (
            <button type="button" className={cn('dayline-btn', storyStep >= 2 && 'is-pressed')}>
              Accept
            </button>
          ) : (
            <span className="dayline-accepted">
              <Check size={12} /> Accepted
            </span>
          )}
        </div>
        <div className={cn('dayline-slot', accepted && 'is-filled')} />
      </div>
    </StageFrame>
  )
}
