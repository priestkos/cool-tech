import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force"
import { useEffect, useMemo, useRef, useState } from "react"
import type { LabEntity, LabRelation } from "@/lib/graph/types"

interface GraphNode extends SimulationNodeDatum {
  id: string
  label: string
  entity: LabEntity
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  id: string
  relation: LabRelation
  retired: boolean
}

export interface ForceGraphProps {
  entities: LabEntity[]
  relations: LabRelation[]
  retiredRelations: LabRelation[]
  highlightRelationIds: string[]
  highlightEntityIds: string[]
  onSelectEntity: (entity: LabEntity) => void
  onSelectRelation: (relation: LabRelation) => void
}

export function ForceGraph({
  entities,
  relations,
  retiredRelations,
  highlightRelationIds,
  highlightEntityIds,
  onSelectEntity,
  onSelectRelation,
}: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [links, setLinks] = useState<GraphLink[]>([])

  const entityById = useMemo(() => {
    const map = new Map<string, LabEntity>()
    for (const e of entities) map.set(e.id, e)
    return map
  }, [entities])

  useEffect(() => {
    const activeIds = new Set(entities.map((e) => e.id))
    const graphNodes: GraphNode[] = entities.map((entity) => ({
      id: entity.id,
      label: entity.name,
      entity,
    }))

    const visibleRelations = [
      ...relations,
      ...retiredRelations.filter(
        (r) => activeIds.has(r.fromEntity) && activeIds.has(r.toEntity),
      ),
    ]

    const graphLinks: GraphLink[] = visibleRelations
      .map((relation) => ({
        id: relation.id,
        relation,
        retired: !relation.isCurrent,
        source: relation.fromEntity,
        target: relation.toEntity,
      }))
      .filter((link) => {
        const s = link.source as string
        const t = link.target as string
        return activeIds.has(s) && activeIds.has(t)
      })

    const sim: Simulation<GraphNode, GraphLink> = forceSimulation(graphNodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(graphLinks)
          .id((d) => d.id)
          .distance(110),
      )
      .force("charge", forceManyBody().strength(-280))
      .force("center", forceCenter(0, 0))

    const tick = () => {
      setNodes([...sim.nodes()])
      setLinks(
        graphLinks.map((link) => {
          const source =
            typeof link.source === "object"
              ? link.source
              : graphNodes.find((n) => n.id === link.source)!
          const target =
            typeof link.target === "object"
              ? link.target
              : graphNodes.find((n) => n.id === link.target)!
          return { ...link, source, target }
        }),
      )
    }

    sim.on("tick", tick)
    return () => {
      sim.stop()
    }
  }, [entities, relations, retiredRelations])

  const width = 640
  const height = 420

  return (
    <svg
      ref={svgRef}
      viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
      className="h-full w-full bg-muted/20"
      role="img"
      aria-label="Knowledge graph force view"
    >
      {links.map((link) => {
        const source = link.source as GraphNode
        const target = link.target as GraphNode
        if (!source || !target) return null
        const highlighted = highlightRelationIds.includes(link.id)
        const stroke = link.retired
          ? "var(--muted-foreground)"
          : highlighted
            ? "var(--primary)"
            : "var(--border)"
        const strokeWidth = highlighted ? 3 : link.retired ? 1 : 1.5
        const dash = link.retired ? "6 4" : undefined
        return (
          <g key={link.id}>
            <line
              x1={source.x ?? 0}
              y1={source.y ?? 0}
              x2={target.x ?? 0}
              y2={target.y ?? 0}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={dash}
              onClick={() => onSelectRelation(link.relation)}
              className="cursor-pointer"
            />
            <text
              x={((source.x ?? 0) + (target.x ?? 0)) / 2}
              y={((source.y ?? 0) + (target.y ?? 0)) / 2}
              className="fill-muted-foreground text-[9px]"
              textAnchor="middle"
            >
              {link.relation.type}
            </text>
          </g>
        )
      })}
      {nodes.map((node) => {
        const highlighted = highlightEntityIds.includes(node.id)
        const fill = highlighted ? "var(--primary)" : "var(--card)"
        const stroke = highlighted ? "var(--primary)" : "var(--border)"
        return (
          <g
            key={node.id}
            transform={`translate(${node.x ?? 0},${node.y ?? 0})`}
            onClick={() => onSelectEntity(node.entity)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`Entity ${node.label}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelectEntity(node.entity)
              }
            }}
          >
            <circle r={highlighted ? 22 : 18} fill={fill} stroke={stroke} strokeWidth={2} />
            <text
              y={4}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-medium"
            >
              {node.label.length > 14
                ? `${node.label.slice(0, 12)}…`
                : node.label}
            </text>
            <text y={16} textAnchor="middle" className="fill-muted-foreground text-[8px]">
              {entityById.get(node.id)?.type}
            </text>
          </g>
        )
      })}
    </svg>
  )
}