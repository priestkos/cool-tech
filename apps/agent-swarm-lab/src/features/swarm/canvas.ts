import { DEFAULT_AGENT_COLORS } from "./types"

export type AgentCursor = {
  id: number
  label: string
  color: string
  x: number
  y: number
}

export type FrameRect = {
  x: number
  y: number
  w: number
  h: number
}

export type SwarmCanvasFrame = {
  agents: AgentCursor[]
  frame: FrameRect
  frameProgress: number
  scanProgress: number
  typeCaret: { x: number; y: number } | null
  showLabels: boolean
  phase: string
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function defaultAgents(
  frame: FrameRect,
  labels: string[],
  _showLabels: boolean,
): AgentCursor[] {
  const corners = [
    { x: frame.x - 36, y: frame.y - 28 },
    { x: frame.x + frame.w + 28, y: frame.y - 24 },
    { x: frame.x - 32, y: frame.y + frame.h + 20 },
    { x: frame.x + frame.w + 24, y: frame.y + frame.h + 24 },
  ]
  return corners.slice(0, 4).map((c, i) => ({
    id: i,
    label: labels[i] ?? `Agent ${i + 1}`,
    color: DEFAULT_AGENT_COLORS[i % DEFAULT_AGENT_COLORS.length],
    x: c.x,
    y: c.y,
  }))
}

export function animateAgentsEnter(
  agents: AgentCursor[],
  frame: FrameRect,
  progress: number,
): AgentCursor[] {
  const targets = defaultAgents(frame, agents.map((a) => a.label), true)
  return agents.map((agent, i) => {
    const target = targets[i]
    const startX = agent.x
    const startY = agent.y
    return {
      ...agent,
      x: lerp(startX, target.x, progress),
      y: lerp(startY, target.y, progress),
    }
  })
}

export function drawSwarmFrame(
  ctx: CanvasRenderingContext2D,
  snapshot: SwarmCanvasFrame,
  dpr: number,
) {
  const { width, height } = ctx.canvas
  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.scale(dpr, dpr)

  const { frame, frameProgress, scanProgress, agents, showLabels, typeCaret } =
    snapshot

  if (frameProgress > 0 && frameProgress < 1.001) {
    const perimeter = 2 * (frame.w + frame.h)
    const drawn = perimeter * Math.min(1, frameProgress)
    ctx.strokeStyle = "rgba(99, 102, 241, 0.85)"
    ctx.lineWidth = 2
    ctx.lineJoin = "round"
    ctx.beginPath()
    let remaining = drawn
    const segments = [
      { len: frame.w, from: { x: frame.x, y: frame.y }, to: { x: frame.x + frame.w, y: frame.y } },
      { len: frame.h, from: { x: frame.x + frame.w, y: frame.y }, to: { x: frame.x + frame.w, y: frame.y + frame.h } },
      { len: frame.w, from: { x: frame.x + frame.w, y: frame.y + frame.h }, to: { x: frame.x, y: frame.y + frame.h } },
      { len: frame.h, from: { x: frame.x, y: frame.y + frame.h }, to: { x: frame.x, y: frame.y } },
    ]
    let started = false
    for (const seg of segments) {
      if (remaining <= 0) break
      const segDraw = Math.min(seg.len, remaining)
      const t = segDraw / seg.len
      const endX = lerp(seg.from.x, seg.to.x, t)
      const endY = lerp(seg.from.y, seg.to.y, t)
      if (!started) {
        ctx.moveTo(seg.from.x, seg.from.y)
        started = true
      }
      ctx.lineTo(endX, endY)
      remaining -= segDraw
    }
    ctx.stroke()
  }

  if (scanProgress > 0 && scanProgress <= 1) {
    const y = frame.y + frame.h * scanProgress
    const grad = ctx.createLinearGradient(frame.x, y - 6, frame.x, y + 6)
    grad.addColorStop(0, "rgba(34, 197, 94, 0)")
    grad.addColorStop(0.5, "rgba(34, 197, 94, 0.55)")
    grad.addColorStop(1, "rgba(34, 197, 94, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(frame.x, y - 4, frame.w, 8)
    ctx.strokeStyle = "rgba(34, 197, 94, 0.9)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(frame.x, y)
    ctx.lineTo(frame.x + frame.w, y)
    ctx.stroke()
  }

  for (const agent of agents) {
    ctx.fillStyle = agent.color
    ctx.beginPath()
    ctx.arc(agent.x, agent.y, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 1.5
    ctx.stroke()
    if (showLabels) {
      ctx.font = "600 10px ui-sans-serif, system-ui, sans-serif"
      const text = agent.label
      const metrics = ctx.measureText(text)
      const pad = 4
      const bx = agent.x + 10
      const by = agent.y - 22
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)"
      ctx.strokeStyle = agent.color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(bx, by, metrics.width + pad * 2, 16, 4)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = "#f8fafc"
      ctx.fillText(text, bx + pad, by + 11)
    }
  }

  if (typeCaret) {
    const { x, y } = typeCaret
    ctx.strokeStyle = "rgba(244, 114, 182, 0.95)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, y - 10)
    ctx.lineTo(x, y + 10)
    ctx.stroke()
    ctx.fillStyle = "rgba(244, 114, 182, 0.2)"
    ctx.fillRect(x - 6, y - 12, 12, 24)
  }

  ctx.restore()
}
