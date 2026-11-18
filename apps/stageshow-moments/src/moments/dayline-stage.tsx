import { Button, Card, Text, Window, type Act } from '@stageshow/kit'
import { MomentStageShell } from './moment-stage-shell'
import type { MomentViewMode } from './moment-view'
import './dayline.css'

type S = { accepted: boolean }

const initial: S = { accepted: false }
const poster: S = { accepted: true }

async function script(a: Act<S>) {
  await a.wait(350)
  await a.move('accept')
  await a.wait(260)
  await a.click('accept')
  await a.set({ accepted: true })
  await a.wait(700)
}

type Props = {
  mode: MomentViewMode
  playKey: number
  forceStill: boolean
  fill?: boolean
}

export function DaylineStage({ mode, playKey, forceStill, fill }: Props) {
  return (
    <MomentStageShell<S>
      width={320}
      height={260}
      compact={{ below: 340, width: 300, height: 240 }}
      initial={initial}
      poster={poster}
      script={script}
      mode={mode}
      playKey={playKey}
      forceStill={forceStill}
      fill={fill}
      className="dl-stage"
      cursor={{ at: 'accept', ripple: true }}
    >
      {(s) => (
        <Window url="dayline.app/week" className="dl-window">
          <div className="dl-week">
            {['Mon', 'Tue', 'Wed', 'Thu'].map((d) => (
              <span key={d} className="dl-day">
                {d}
              </span>
            ))}
          </div>
          <Card className={`dl-invite ${s.accepted ? 'dl-invite--accepted' : ''}`} data-target="invite">
            <Text className="dl-title">Design review</Text>
            <Text className="dl-time">Thu 2:00</Text>
            <Button
              data-target="accept"
              variant={s.accepted ? 'secondary' : 'primary'}
              className="dl-accept"
            >
              {s.accepted ? 'Accepted' : 'Accept'}
            </Button>
          </Card>
          <div className="dl-slot" data-filled={s.accepted || undefined} />
        </Window>
      )}
    </MomentStageShell>
  )
}

export const DAYLINE_PLAY_MS = 1800