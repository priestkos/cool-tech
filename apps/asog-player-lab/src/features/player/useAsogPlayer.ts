import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { AsogThreePlayer } from "@animated-sog/three"
import type { ClipId } from "./clips"
import { CLIPS } from "./clips"
import { createPlaybackClock } from "./playbackClock"
import { CAMERA_FOV_DEG, frameOrbit } from "./frameOrbit"

export type LoadPhase = "idle" | "loading" | "ready" | "error" | "no-webgl"

export type PlayerStats = {
  numSplats: number
  numVisible: number
  fileBytes: number
  loadMs: number
  decodeMs: number
  duration: number
  time: number
  fps: number
  hasAudio: boolean
}

type AsogPlayerInstance = Awaited<ReturnType<typeof AsogThreePlayer.load>>

export function useAsogPlayer(clipId: ClipId, canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [phase, setPhase] = useState<LoadPhase>("idle")
  const [loadProgress, setLoadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(true)
  const [scrubTime, setScrubTime] = useState(0)
  const scrubbingRef = useRef(false)
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)

  const clockRef = useRef(createPlaybackClock(true))
  const playerRef = useRef<AsogPlayerInstance | null>(null)
  const viewerRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    fps: number
    raf: number
  } | null>(null)

  const syncStats = useCallback(() => {
    const p = playerRef.current
    if (!p?.stats) return
    setStats({
      numSplats: p.numSplats,
      numVisible: p.numVisible,
      fileBytes: p.stats.fileBytes,
      loadMs: p.stats.loadMs,
      decodeMs: p.stats.decodeMs,
      duration: p.duration,
      time: p.time,
      fps: viewerRef.current?.fps ?? 0,
      hasAudio: p.hasAudio,
    })
  }, [])

  const teardown = useCallback(() => {
    if (viewerRef.current) {
      cancelAnimationFrame(viewerRef.current.raf)
      viewerRef.current.controls.dispose()
      viewerRef.current.renderer.dispose()
      viewerRef.current = null
    }
    playerRef.current?.destroy?.()
    playerRef.current = null
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    teardown()
    setPhase("loading")
    setError(null)
    setLoadProgress(0)
    setStats(null)
    setScrubTime(0)
    clockRef.current = createPlaybackClock(true)
    setPlaying(true)

    let cancelled = false
    let frames = 0
    let fpsStart = performance.now()

    const gl = canvas.getContext("webgl2")
    if (!gl) {
      setPhase("no-webgl")
      setError("WebGL 2 is required to render Animated SOG splats.")
      return
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, context: gl })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV_DEG, 1, 0.01, 500)
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = false
    controls.minDistance = 0.05
    controls.maxDistance = 200
    let interacting = false
    let idleSince = 0
    controls.addEventListener("start", () => {
      interacting = true
    })
    controls.addEventListener("end", () => {
      interacting = false
      idleSince = performance.now()
    })
    canvas.addEventListener("wheel", () => {
      idleSince = performance.now()
    }, { passive: true })
    camera.position.set(0, 1, 3)
    controls.target.set(0, 1, 0)

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.clientWidth
      const h = parent.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)

    const timer = new THREE.Timer()
    const clock = clockRef.current

    const tick = (timestamp: number) => {
      if (cancelled) return
      timer.update(timestamp)
      controls.autoRotate = !interacting && performance.now() - idleSince > 2500
      controls.autoRotateSpeed = 4 / 3
      controls.update(timer.getDelta())
      renderer.render(scene, camera)

      frames++
      const now = performance.now()
      if (now - fpsStart >= 1000) {
        if (viewerRef.current) {
          viewerRef.current.fps = Math.round((frames * 1000) / (now - fpsStart))
        }
        frames = 0
        fpsStart = now
        syncStats()
      }

      const p = playerRef.current
      if (p?.stats && !scrubbingRef.current) {
        setScrubTime(p.time)
      }
      viewerRef.current!.raf = requestAnimationFrame(tick)
    }

    viewerRef.current = { renderer, scene, camera, controls, fps: 0, raf: 0 }

    const src = CLIPS[clipId].path

    ;(async () => {
      try {
        const player = await AsogThreePlayer.load(renderer, src, scene, {
          getTime: () => clock.now(),
          volume: 0,
          onProgress: (p) => {
            if (!cancelled) setLoadProgress(p)
          },
        })
        if (cancelled) {
          player.destroy()
          return
        }
        playerRef.current = player

        const { min, max } = player.bounds
        const framed = frameOrbit(
          [min[0], min[1], min[2]],
          [max[0], max[1], max[2]],
        )
        const centre = new THREE.Vector3(framed.target[0], framed.target[1], framed.target[2])
        player.object.updateMatrixWorld()
        centre.applyMatrix4(player.object.matrixWorld)
        controls.target.copy(centre)
        const offset = new THREE.Vector3(framed.offset[0], framed.offset[1], framed.offset[2])
        camera.position.copy(centre).add(offset)
        controls.update()

        setPhase("ready")
        syncStats()
        viewerRef.current!.raf = requestAnimationFrame(tick)
      } catch (e) {
        if (!cancelled) {
          setPhase("error")
          setError(e instanceof Error ? e.message : String(e))
        }
      }
    })()

    return () => {
      cancelled = true
      ro.disconnect()
      teardown()
    }
  }, [clipId, canvasRef, syncStats, teardown])

  const togglePlay = useCallback(() => {
    clockRef.current.toggle()
    setPlaying(clockRef.current.playing)
  }, [])

  const seek = useCallback((t: number) => {
    clockRef.current.set(t)
    setScrubTime(t)
  }, [])

  const toggleSound = useCallback(async () => {
    const p = playerRef.current
    if (!p?.hasAudio) return
    const unmute = p.volume === 0
    if (unmute) await p.listener.context.resume()
    p.volume = unmute ? 1 : 0
    setSoundEnabled(unmute)
  }, [])

  return {
    phase,
    loadProgress,
    error,
    playing,
    scrubTime,
    stats,
    soundEnabled,
    setScrubbing: (v: boolean) => {
      scrubbingRef.current = v
    },
    togglePlay,
    seek,
    toggleSound,
  }
}