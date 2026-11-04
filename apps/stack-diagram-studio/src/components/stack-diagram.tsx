import { useCallback, useMemo, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { categoryIcon, paletteForTheme, USER_TILE } from "@/lib/diagram-theme"
import type { DiagramEdge, DiagramTheme, DiagramTile, LayoutResult, PositionMap } from "@/lib/types"
import { GRID, TILE_HEIGHT, TILE_WIDTH } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StackDiagramProps {
  tiles: DiagramTile[]
  edges: DiagramEdge[]
  positions: PositionMap
  layout: LayoutResult
  diagramTheme: DiagramTheme
  onPositionChange: (instanceId: string, pos: { x: number; y: number }) => void
  onRenameTile?: (instanceId: string, label: string) => void
  onDeleteTile?: (instanceId: string) => void
  selectedId?: string | null
  onSelect?: (instanceId: string | null) => void
}

function edgePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const x1 = from.x + TILE_WIDTH
  const y1 = from.y + TILE_HEIGHT / 2
  const x2 = to.x
  const y2 = to.y + TILE_HEIGHT / 2
  const mid = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
}

function TileBadge({ Icon }: { Icon: LucideIcon }) {
  return <Icon className="size-4 text-muted-foreground" aria-hidden />
}

export function StackDiagram({
  tiles,
  edges,
  positions,
  layout,
  diagramTheme,
  onPositionChange,
  onRenameTile,
  onDeleteTile,
  selectedId,
  onSelect,
}: StackDiagramProps) {
  const palette = useMemo(() => paletteForTheme(diagramTheme), [diagramTheme])
  const allTiles = useMemo(() => [USER_TILE, ...tiles], [tiles])
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{
    id: string
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState("")

  const snap = (v: number) => Math.round(v / GRID) * GRID

  const onPointerDown = useCallback(
    (id: string, e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      const pos = positions[id]
      if (!pos) return
      e.currentTarget.setPointerCapture(e.pointerId)
      dragRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        originX: pos.x,
        originY: pos.y,
      }
      setDraggingId(id)
      onSelect?.(id)
    },
    [onSelect, positions],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag) return
      const dx = e.clientX - drag.startX
      const dy = e.clientY - drag.startY
      onPositionChange(drag.id, {
        x: snap(drag.originX + dx),
        y: snap(drag.originY + dy),
      })
    },
    [onPositionChange],
  )

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId)
      dragRef.current = null
      setDraggingId(null)
    }
  }, [])

  return (
    <div
      className={cn(
        "relative overflow-auto rounded-xl border",
        diagramTheme === "dark" ? "bg-[#1a1a1a]" : "bg-white",
      )}
      style={{ minHeight: 360, height: layout.height }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <svg
        ref={svgRef}
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="block max-w-full"
        role="img"
        aria-label="Architecture diagram"
      >
        <defs>
          <marker id="diagram-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={palette.arrow} />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill={palette.bg} />
        {edges.map((edge) => {
          const from = positions[edge.from]
          const to = positions[edge.to]
          if (!from || !to) return null
          return (
            <path
              key={`${edge.from}-${edge.to}-${edge.kind}`}
              d={edgePath(from, to)}
              fill="none"
              stroke={palette.arrow}
              strokeWidth={1.5}
              markerEnd="url(#diagram-arrow)"
            />
          )
        })}
      </svg>

      {allTiles.map((tile) => {
        const pos = positions[tile.instanceId]
        if (!pos) return null
        const Icon = categoryIcon(tile.category)
        const isSelected = selectedId === tile.instanceId
        return (
          <div
            key={tile.instanceId}
            role="button"
            tabIndex={0}
            className={cn(
              "absolute flex cursor-grab flex-col rounded-[10px] border px-3 py-2 shadow-sm active:cursor-grabbing",
              draggingId === tile.instanceId && "ring-2 ring-ring",
              isSelected && "ring-2 ring-primary/40",
              tile.isUnknown && "border-dashed",
            )}
            style={{
              left: pos.x,
              top: pos.y,
              width: TILE_WIDTH,
              height: TILE_HEIGHT,
              background: palette.tileBg,
              borderColor: palette.border,
              color: palette.text,
            }}
            onPointerDown={(e) => onPointerDown(tile.instanceId, e)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSelect?.(tile.instanceId)
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold"
                style={{ background: palette.badgeBg, color: palette.badgeText }}
              >
                {tile.monogram.slice(0, 3)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold leading-tight">{tile.label}</div>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: palette.muted }}>
                  <TileBadge Icon={Icon} />
                  <span className="capitalize">{tile.category}</span>
                </div>
              </div>
            </div>
            {tile.isUnknown && isSelected && onRenameTile && onDeleteTile && (
              <div className="mt-1 flex flex-col gap-1" onPointerDown={(e) => e.stopPropagation()}>
                <Input
                  className="h-6 text-[10px]"
                  value={renameDraft || tile.label}
                  onChange={(e) => setRenameDraft(e.target.value)}
                  aria-label="Rename unknown tile"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded border px-1 text-[10px]"
                    onClick={() => {
                      const next = (renameDraft || tile.label).trim()
                      if (next) onRenameTile(tile.instanceId, next)
                      setRenameDraft("")
                    }}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="rounded border px-1 text-[10px] text-destructive"
                    onClick={() => onDeleteTile(tile.instanceId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function getDiagramSvgElement(): SVGSVGElement | null {
  return document.querySelector('[aria-label="Architecture diagram"]')
}
