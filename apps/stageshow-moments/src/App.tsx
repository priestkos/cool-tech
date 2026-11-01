import './App.css'
import { useEffect, useState } from 'react'
import { MomentTile } from '@/components/moment-tile'
import { OpenMomentDialog, renderPicture } from '@/components/open-moment-dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMomentsController } from '@/hooks/use-moments-controller'
import { MOMENTS } from '@/lib/moment-registry'
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
  const { reduced, displayFor, showPhase, playStory, setAll } = useMomentsController(
    demoReduced,
  )

  const openDef = MOMENTS.find((m) => m.id === openId) ?? null
  const openRuntime = openId ? displayFor(openId) : null

  return (
    <TooltipProvider>
      <div className="page">
        <header className="page-header">
          <div>
            <p className="page-eyebrow">Unofficial demo</p>
            <h1 className="page-title">Stageshow Moments</h1>
            <p className="page-lead">
              Unofficial demo built by following Benji Taylor&apos;s Stageshow skill. Not made by
              or affiliated with Benji Taylor, and not the Stageshow kit. All brands shown are
              fictional.
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
            return (
              <MomentTile
                key={def.id}
                def={def}
                phase={r.phase}
                storyStep={r.storyStep}
                animating={r.animating}
                reduced={reduced}
                compact={layout.stack || (layout.article && def.span === '2x1')}
                onPhase={(p) => showPhase(def.id, p)}
                onReplay={() => playStory(def.id)}
                onOpen={def.kind === 'stat' ? undefined : () => setOpenId(def.id)}
                picture={
                  def.kind === 'stat' ? (
                    renderPicture(def, r.phase, r.storyStep, reduced, layout.stack)
                  ) : (
                    renderPicture(
                      def,
                      r.phase,
                      r.storyStep,
                      reduced,
                      layout.stack || (layout.article && def.span === '2x1'),
                    )
                  )
                }
              />
            )
          })}
        </main>

        <footer className="page-footer">
          <p>
            Illustrations, not working apps. Design guidance from{' '}
            <Tooltip>
              <TooltipTrigger
                render={
                  <a href="https://benji.org/stageshow" target="_blank" rel="noreferrer">
                    Stageshow
                  </a>
                }
              />
              <TooltipContent>Agent skill for faux product UI</TooltipContent>
            </Tooltip>{' '}
            ·{' '}
            <a
              href="https://github.com/benjitaylor/skills/tree/main/stageshow"
              target="_blank"
              rel="noreferrer"
            >
              skills repo
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
          storyStep={openRuntime?.storyStep ?? 0}
          animating={openRuntime?.animating ?? false}
          reduced={reduced}
          onPhase={(p) => openId && showPhase(openId, p)}
          onReplay={() => openId && playStory(openId)}
        />
      </div>
    </TooltipProvider>
  )
}
