import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"
import {
  animateAgentsEnter,
  defaultAgents,
  drawSwarmFrame,
  type FrameRect,
} from "./canvas"
import {
  applyHiddenHighlight,
  clearHiddenHighlight,
  collectTypableSegments,
  supportsCustomHighlight,
  totalTypableChars,
} from "./highlight"
import {
  beginRun,
  completeImmediately,
  phaseShowsOverlay,
  replay as replayMachine,
  resetSwarm,
  tickSwarm,
  typingRevealIndex,
} from "./machine"
import type { SwarmPhase, TriggerMode } from "./types"

export type SwarmProps = {
  children: ReactNode
  className?: string
  trigger?: TriggerMode
  speed?: number
  reducedMotion?: boolean
  showLabels?: boolean
  agentLabels?: string[]
  runSignal?: number
  replaySignal?: number
  onPhaseChange?: (phase: SwarmPhase) => void
}

export function Swarm({
  children,
  className,
  trigger = "visible",
  speed = 1,
  reducedMotion = false,
  showLabels = true,
  agentLabels = ["Layout", "Style", "Content", "QA"],
  runSignal = 0,
  replaySignal = 0,
  onPhaseChange,
}: SwarmProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const typableRef = useRef<HTMLDivElement>(null)
  const segmentsRef = useRef(collectTypableSegments(document.createElement("div")))
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const visibleRef = useRef(false)
  const mountedRef = useRef(false)

  const [runtime, setRuntime] = useState(() =>
    reducedMotion ? completeImmediately(resetSwarm()) : resetSwarm(),
  )

  const measureFrame = useCallback((): FrameRect => {
    const el = rootRef.current
    if (!el) return { x: 0, y: 0, w: 200, h: 120 }
    const outer = el.getBoundingClientRect()
    const parent = el.offsetParent as HTMLElement | null
    const parentRect = parent?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: outer.width,
      height: outer.height,
    }
    const pad = 2
    return {
      x: outer.left - parentRect.left + pad,
      y: outer.top - parentRect.top + pad,
      w: Math.max(40, outer.width - pad * 2),
      h: Math.max(40, outer.height - pad * 2),
    }
  }, [])

  const paintCanvas = useCallback(
    (phase: SwarmPhase, frameProgress: number, scanProgress: number, typeProgress: number, enterProgress: number) => {
      const canvas = canvasRef.current
      const host = rootRef.current?.parentElement
      if (!canvas || !host) return
      const dpr = window.devicePixelRatio || 1
      const w = host.clientWidth
      const h = host.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const frame = measureFrame()
      let agents = defaultAgents(frame, agentLabels, showLabels)
      if (phase === "enter") {
        const fromOffscreen = agents.map((a, i) => ({
          ...a,
          x: i % 2 === 0 ? -40 : w + 40,
          y: i < 2 ? -30 : h + 30,
        }))
        agents = animateAgentsEnter(fromOffscreen, frame, enterProgress)
      }
      const typeCaret =
        phase === "type" && typableRef.current
          ? (() => {
              const rect = typableRef.current!.getBoundingClientRect()
              const parentRect = host.getBoundingClientRect()
              return {
                x: rect.left - parentRect.left + rect.width * typeProgress,
                y: rect.top - parentRect.top + rect.height / 2,
              }
            })()
          : null
      drawSwarmFrame(ctx, {
        agents,
        frame,
        frameProgress: phase === "frame" || phase === "scan" || phase === "type" || phase === "exit" || phase === "complete" ? Math.max(frameProgress, phase === "frame" ? frameProgress : 1) : 0,
        scanProgress: phase === "scan" ? scanProgress : phase === "type" || phase === "exit" || phase === "complete" ? 1 : 0,
        typeCaret,
        showLabels,
        phase,
      }, dpr)
    },
    [agentLabels, measureFrame, showLabels],
  )

  const syncHighlights = useCallback(
    (phase: SwarmPhase, typeProgress: number) => {
      const typable = typableRef.current
      if (!typable) return
      if (!supportsCustomHighlight()) return
      if (reducedMotion || phase === "complete") {
        clearHiddenHighlight()
        return
      }
      if (phase === "idle" || phase === "enter" || phase === "frame" || phase === "scan") {
        applyHiddenHighlight(segmentsRef.current, 0)
        return
      }
      if (phase === "type" || phase === "exit") {
        const total = totalTypableChars(segmentsRef.current)
        const reveal = typingRevealIndex(typeProgress, total)
        applyHiddenHighlight(segmentsRef.current, reveal)
        return
      }
    },
    [reducedMotion],
  )

  useEffect(() => {
    onPhaseChange?.(runtime.phase)
  }, [runtime.phase, onPhaseChange])

  useEffect(() => {
    mountedRef.current = true
    if (reducedMotion) {
      setRuntime(completeImmediately(resetSwarm()))
      clearHiddenHighlight()
      return
    }
    if (trigger === "mount") {
      setRuntime((s) => beginRun(s))
    }
  }, [trigger, reducedMotion])

  useEffect(() => {
    if (reducedMotion || trigger !== "manual") return
    if (runSignal > 0) {
      setRuntime((s) => beginRun(s))
    }
  }, [runSignal, trigger, reducedMotion])

  useEffect(() => {
    if (replaySignal === 0) return
    if (reducedMotion) {
      setRuntime(completeImmediately(replayMachine(resetSwarm())))
      clearHiddenHighlight()
      return
    }
    setRuntime((s) => replayMachine(s))
  }, [replaySignal, reducedMotion])

  useEffect(() => {
    const el = rootRef.current
    if (!el || trigger !== "visible" || reducedMotion) return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting)
        visibleRef.current = visible
        if (visible && runtime.phase === "idle" && runtime.runId === 0) {
          setRuntime((s) => beginRun(s))
        }
      },
      { threshold: 0.35 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [trigger, reducedMotion, runtime.phase, runtime.runId])

  useLayoutEffect(() => {
    if (!typableRef.current) return
    segmentsRef.current = collectTypableSegments(typableRef.current)
    syncHighlights(runtime.phase, runtime.typeProgress)
  })

  useEffect(() => {
    syncHighlights(runtime.phase, runtime.typeProgress)
    if (!phaseShowsOverlay(runtime.phase, reducedMotion)) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }
    paintCanvas(
      runtime.phase,
      runtime.frameProgress,
      runtime.scanProgress,
      runtime.typeProgress,
      runtime.phase === "enter" ? runtime.phaseProgress : 1,
    )
  }, [runtime, reducedMotion, paintCanvas, syncHighlights])

  useEffect(() => {
    if (reducedMotion) return
    if (!runtime.playing) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      return
    }
    const loop = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const delta = ts - lastTsRef.current
      lastTsRef.current = ts
      setRuntime((s) => tickSwarm(s, delta, speed, reducedMotion))
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = null
    }
  }, [runtime.playing, speed, reducedMotion, runtime.runId])

  useEffect(() => {
    return () => clearHiddenHighlight()
  }, [])

  const overlayActive = phaseShowsOverlay(runtime.phase, reducedMotion)

  return (
    <div className={cn("relative", className)}>
      {overlayActive ? (
        <canvas
          ref={canvasRef}
          className="swarm-canvas pointer-events-none absolute inset-0 z-20"
          aria-hidden
        />
      ) : null}
      <div
        ref={rootRef}
        className="swarm-target relative z-10"
        data-swarm-phase={runtime.phase}
      >
        <div ref={typableRef} className="swarm-typable contents">
          {children}
        </div>
      </div>
    </div>
  )
}

export { supportsCustomHighlight }
