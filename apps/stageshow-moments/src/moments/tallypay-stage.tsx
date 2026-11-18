import { Button, Count, Text, Window, type Act } from '@stageshow/kit'
import { MomentStageShell } from './moment-stage-shell'
import type { MomentViewMode } from './moment-view'
import './tallypay.css'

type S = { paid: boolean; amount: number }

const initial: S = { paid: false, amount: 0 }
const poster: S = { paid: true, amount: 14.5 }

async function script(a: Act<S>) {
  await a.wait(300)
  await a.move('pay')
  await a.wait(240)
  await a.click('pay')
  await a.set({ paid: true })
  await a.wait(200)
  await a.set({ amount: 14.5 })
  await a.wait(900)
}

type Props = {
  mode: MomentViewMode
  playKey: number
  forceStill: boolean
  fill?: boolean
}

export function TallypayStage({ mode, playKey, forceStill, fill }: Props) {
  return (
    <MomentStageShell<S>
      width={320}
      height={280}
      compact={{ below: 340, width: 300, height: 260 }}
      initial={initial}
      poster={poster}
      script={script}
      mode={mode}
      playKey={playKey}
      forceStill={forceStill}
      fill={fill}
      className="tp-stage"
      cursor={{ at: 'pay', ripple: true }}
    >
      {(s) => (
        <>
          <Window url="tallypay.app/checkout" className="tp-window">
            <Text className="tp-merchant">Harbor Café</Text>
            <Count
              className="tp-amount"
              value={s.amount}
              duration={700}
              format={(n) => `$${n.toFixed(2)}`}
            />
            <Button data-target="pay" variant={s.paid ? 'secondary' : 'primary'}>
              {s.paid ? 'Paid' : 'Pay'}
            </Button>
          </Window>
          {s.paid ? <p className="tp-receipt">Paid · $14.50</p> : null}
        </>
      )}
    </MomentStageShell>
  )
}

export const TALLYPAY_PLAY_MS = 2000