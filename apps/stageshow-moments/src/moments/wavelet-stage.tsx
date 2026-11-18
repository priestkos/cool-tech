import { Bar, Button, Text, Window, type Act } from '@stageshow/kit'
import { MomentStageShell } from './moment-stage-shell'
import type { MomentViewMode } from './moment-view'
import './wavelet.css'

type S = { playing: boolean; progress: number }

const initial: S = { playing: false, progress: 28 }
const poster: S = { playing: true, progress: 58 }

async function script(a: Act<S>) {
  await a.wait(400)
  await a.move('play')
  await a.wait(280)
  await a.click('play')
  await a.set({ playing: true, progress: 42 })
  await a.wait(500)
  await a.set({ progress: 58 })
  await a.wait(600)
}

const WIDE = { w: 420, h: 280 }
const COMPACT = { below: 400, width: 300, height: 240 }

type Props = {
  mode: MomentViewMode
  playKey: number
  forceStill: boolean
  fill?: boolean
}

export function WaveletStage({ mode, playKey, forceStill, fill }: Props) {
  return (
    <MomentStageShell<S>
      width={WIDE.w}
      height={WIDE.h}
      compact={COMPACT}
      initial={initial}
      poster={poster}
      script={script}
      mode={mode}
      playKey={playKey}
      forceStill={forceStill}
      fill={fill}
      className="wl-stage"
      cursor={{ at: { wide: { at: 'play', x: 0.5, y: 0.5 }, compact: { at: 'play', x: 0.5, y: 0.5 } }, ripple: true }}
    >
      {(s, _rect, layout) => {
        const compact = layout === 'compact'
        return (
          <Window url="wavelet.app/player" className="wl-window">
            <div className="wl-body" data-compact={compact || undefined}>
              <div className="wl-art" aria-hidden />
              <div className="wl-meta">
                <Text className="wl-track">Midnight Drive</Text>
                <Text className="wl-artist">Maya Chen</Text>
                <div className="wl-progress" data-target="progress">
                  <div
                    className="wl-progress-fill"
                    data-playing={s.playing || undefined}
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
                <div className="wl-controls">
                  <Bar w={14} h={14} r={4} tone={3} />
                  <Button
                    data-target="play"
                    variant={s.playing ? 'secondary' : 'primary'}
                    className="wl-play"
                  >
                    {s.playing ? 'Pause' : 'Play'}
                  </Button>
                  <Bar w={14} h={14} r={4} tone={3} />
                </div>
                <Text className="wl-status" data-lit={s.playing || undefined}>
                  {s.playing ? 'Playing' : 'Paused'}
                </Text>
              </div>
            </div>
          </Window>
        )
      }}
    </MomentStageShell>
  )
}

export const WAVELET_PLAY_MS = 2400