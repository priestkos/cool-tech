import { Bubble, Receipt, Text, Thread, type Act } from '@stageshow/kit'
import { MomentStageShell } from './moment-stage-shell'
import type { MomentViewMode } from './moment-view'
import './natter.css'

type S = { sent: boolean; delivered: boolean; react: boolean }

const initial: S = { sent: false, delivered: false, react: false }
const poster: S = { sent: true, delivered: true, react: true }

async function script(a: Act<S>) {
  await a.wait(400)
  a.mark('type')
  await a.wait(500)
  await a.set({ sent: true })
  await a.wait(450)
  await a.set({ delivered: true })
  await a.wait(500)
  await a.set({ react: true })
  await a.wait(700)
}

type Props = {
  mode: MomentViewMode
  playKey: number
  forceStill: boolean
  fill?: boolean
}

export function NatterStage({ mode, playKey, forceStill, fill }: Props) {
  return (
    <MomentStageShell<S>
      width={300}
      height={280}
      compact={{ below: 320, width: 280, height: 260 }}
      initial={initial}
      poster={poster}
      script={script}
      mode={mode}
      playKey={playKey}
      forceStill={forceStill}
      fill={fill}
      className="nt-stage"
    >
      {(s) => (
        <Thread app="imessage" className="nt-thread">
          <Text className="nt-header">Natter · Sam Rivera</Text>
          {s.sent ? (
            <Bubble from="me" className="nt-bubble" data-target="bubble">
              On my way
            </Bubble>
          ) : (
            <Text className="nt-typing">Typing…</Text>
          )}
          {s.delivered ? (
            <div className="nt-meta">
              <Receipt>Delivered</Receipt>
              {s.react ? <span className="nt-react">👍</span> : null}
            </div>
          ) : null}
        </Thread>
      )}
    </MomentStageShell>
  )
}

export const NATTER_PLAY_MS = 2800