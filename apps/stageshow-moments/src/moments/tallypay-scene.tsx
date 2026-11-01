import { Check } from 'lucide-react'
import { Bar, InitialTile, StageFrame } from '@/components/stage-frame'
import { cn } from '@/lib/utils'

export type TallypaySceneProps = {
  phase: 'before' | 'after'
  storyStep: number
  compact?: boolean
}

export function TallypayScene({ phase, storyStep, compact }: TallypaySceneProps) {
  const paid = phase === 'after' || storyStep >= 3
  const amount = paid ? '$14.50' : '$12.00'
  return (
    <StageFrame width={compact ? 280 : 320} compact={compact}>
      <div className="tallypay">
        <header className="tallypay-head">
          <InitialTile label="Tallypay" />
          <span>Tallypay</span>
        </header>
        <p className="tallypay-merchant">Harbor Café</p>
        <Bar className="w-20" />
        <p
          className={cn('tallypay-amount', (storyStep >= 2 || paid) && 'is-counted')}
          data-value={amount}
        >
          {amount}
        </p>
        <div className="tallypay-card">
          <InitialTile label="Card" className="tallypay-card-mark" />
          <Bar className="flex-1" />
        </div>
        {!paid ? (
          <button type="button" className={cn('tallypay-pay', storyStep >= 1 && 'is-pressed')}>
            Pay
          </button>
        ) : (
          <span className="tallypay-paid">
            <Check size={14} /> Paid
          </span>
        )}
        <div
          className={cn(
            'tallypay-receipt',
            (storyStep >= 4 || paid) && 'tallypay-receipt--visible',
          )}
        >
          <p>Paid</p>
          <Bar className="w-12" />
        </div>
      </div>
    </StageFrame>
  )
}
