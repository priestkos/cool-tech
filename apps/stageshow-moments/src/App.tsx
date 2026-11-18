import './App.css'
import { useEffect, useState } from 'react'
import { MomentTile } from '@/components/moment-tile'
import { OpenMomentDialog } from '@/components/open-moment-dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useMomentsController } from '@/hooks/use-moments-controller'
import { MOMENTS } from '@/lib/moment-registry'
import { RenderMomentStage } from '@/moments/render-moment-stage'
import './moments.css'

function useCompactLayout() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  )
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return {
    width,
    stack: width <= 358,
    article: width <= 550,
  }
}

export default function App() {
  const [demoReduced, setDemoReduced] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const layout = useCompactLayout()
  const { reduced, displayFor, showPhase, playStory, setAll } =
    useMomentsController(demoReduced)

  const openDef = MOMENTS.find((m) => m.id === openId) ?? null
  const openRuntime = openId ? displayFor(openId) : null

  return (
    <TooltipProvider>
      <div className="page">
        <header className="page-header">
          <div>
            <p className="page-eyebrow">Benji Taylor · Stageshow kit</p>
            <h1 className="page-title">Stageshow Moments</h1>
            <p className="page-lead">
              Community lab using the real{' '}
              <a href="https://github.com/benjitaylor/skills/tree/stageshow-v1.1.1/stageshow">
                Stageshow React kit
              </a>{' '}
              (vendored at <code>stageshow-v1.1.1</code>). Fictional product names only; not
              affiliated with Benji Taylor.
            </p>
          </div>
          <div className="page-actions">
            <div className="page-global">
              <Button type="button" variant="outline" size="sm" onClick={() => setAll('before')}>
                All Before
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setAll('after')}>
                All After
              </Button>
            </div>
            <label className="reduced-switch">
              <Switch checked={demoReduced} onCheckedChange={setDemoReduced} />
              <span>Reduced motion</span>
            </label>
          </div>
        </header>

        <main
          className={`bento-grid ${layout.article ? 'bento-grid--article' : ''} ${layout.stack ? 'bento-grid--stack' : ''}`}
        >
          {MOMENTS.map((def) => {
            const r = displayFor(def.id)
            const compact =
              layout.stack || (layout.article && def.span === '2x1')
            return (
              <MomentTile
                key={def.id}
                def={def}
                phase={r.phase}
                compact={compact}
                onPhase={(p) => showPhase(def.id, p)}
                onReplay={() => playStory(def.id)}
                onOpen={def.kind === 'stat' ? undefined : () => setOpenId(def.id)}
                picture={
                  <RenderMomentStage
                    def={def}
                    phase={r.phase}
                    playing={r.playing}
                    playKey={r.playKey}
                    reduced={reduced}
                  />
                }
              />
            )
          })}
        </main>

        <footer className="page-footer">
          <p>
            Illustrations, not working apps. Kit:{' '}
            <a
              href="https://github.com/benjitaylor/skills/tree/stageshow-v1.1.1/stageshow"
              target="_blank"
              rel="noreferrer"
            >
              benjitaylor/skills @ stageshow-v1.1.1
            </a>{' '}
            ·{' '}
            <a
              href="https://x.com/benjitaylor/status/2116593247854453244"
              target="_blank"
              rel="noreferrer"
            >
              source post
            </a>
          </p>
        </footer>

        <OpenMomentDialog
          open={Boolean(openId)}
          onOpenChange={(o) => !o && setOpenId(null)}
          def={openDef}
          phase={openRuntime?.phase ?? 'before'}
          playing={openRuntime?.playing ?? false}
          playKey={openRuntime?.playKey ?? 0}
          reduced={reduced || demoReduced}
          onPhase={(p) => openId && showPhase(openId, p)}
          onReplay={() => openId && playStory(openId)}
        />
      </div>
    </TooltipProvider>
  )
}