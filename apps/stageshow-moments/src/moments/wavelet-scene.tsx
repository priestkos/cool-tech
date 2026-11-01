import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Bar, StageFrame } from '@/components/stage-frame'
import { cn } from '@/lib/utils'

export type WaveletSceneProps = {
  phase: 'before' | 'after'
  storyStep: number
  showCursor: boolean
  compact?: boolean
  large?: boolean
}

export function WaveletScene({
  phase,
  storyStep,
  showCursor,
  compact,
  large,
}: WaveletSceneProps) {
  const playing = phase === 'after' || storyStep >= 3
  const progress = playing ? (storyStep >= 4 ? 58 : 42) : 28
  const cursorOnPlay = showCursor && storyStep >= 1

  return (
    <StageFrame width={compact ? 300 : 420} compact={compact}>
      <div className={cn('wavelet', large && 'wavelet--large')}>
        <div className="wavelet-chrome">
          <span className="wavelet-dot" />
          <span className="wavelet-dot" />
          <span className="wavelet-dot" />
          <span className="wavelet-title">Wavelet</span>
        </div>
        <div className="wavelet-body">
          <div
            className="wavelet-art"
            style={{
              background:
                'linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)',
            }}
          />
          <div className="wavelet-meta">
            <p className="wavelet-track">Midnight Drive</p>
            <p className="wavelet-artist">Maya Chen</p>
            <div className="wavelet-progress">
              <div
                className={cn('wavelet-progress-fill', playing && 'is-live')}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="wavelet-controls">
              <SkipBack size={14} strokeWidth={2} />
              <button
                type="button"
                className={cn(
                  'wavelet-play',
                  playing && 'is-playing',
                  storyStep === 2 && 'is-pressed',
                )}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </button>
              <SkipForward size={14} strokeWidth={2} />
            </div>
            <p className={cn('wavelet-status', playing && 'is-lit')}>
              {playing ? 'Playing' : 'Paused'}
            </p>
          </div>
          <Bar className="w-24" />
        </div>
        {cursorOnPlay ? (
          <div
            className={cn('demo-cursor', storyStep >= 2 && 'demo-cursor--click')}
            style={{ left: compact ? 118 : 168, top: compact ? 198 : 228 }}
          />
        ) : null}
      </div>
    </StageFrame>
  )
}
