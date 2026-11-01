import type { RefMapEntry, TreeNode } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Props {
  tree: TreeNode
  refMap: Map<string, RefMapEntry>
  highlightKey: string | null
  onHighlight: (key: string | null) => void
}

interface NodeProps {
  node: TreeNode
  depth: number
  refMap: Map<string, RefMapEntry>
  highlightKey: string | null
  onHighlight: (key: string | null) => void
}

function elementKeyForNode(node: TreeNode, refMap: Map<string, RefMapEntry>): string | null {
  if (node.ref_id) {
    return refMap.get(node.ref_id)?.elementKey ?? null
  }
  return null
}

function TreeNodeRow({ node, depth, refMap, highlightKey, onHighlight }: NodeProps) {
  const key = elementKeyForNode(node, refMap)
  const active = key && highlightKey === key
  return (
    <div>
      <button
        type="button"
        className={cn(
          "block w-full truncate rounded px-1 py-0.5 text-left font-mono text-[11px] hover:bg-muted",
          active && "bg-amber-100",
        )}
        style={{ paddingLeft: depth * 12 + 4 }}
        onMouseEnter={() => onHighlight(key)}
        onMouseLeave={() => onHighlight(null)}
        onClick={() => onHighlight(key)}
      >
        <span className="text-muted-foreground">{node.role}</span>{" "}
        <span>{node.name || "—"}</span>
        {node.ref_id ? (
          <span className="ml-1 text-sky-700">{node.ref_id}</span>
        ) : null}
      </button>
      {node.children?.map((c, i) => (
        <TreeNodeRow
          key={`${depth}-${i}-${c.name}-${c.role}`}
          node={c}
          depth={depth + 1}
          refMap={refMap}
          highlightKey={highlightKey}
          onHighlight={onHighlight}
        />
      ))}
    </div>
  )
}

export function TreeOutline({ tree, refMap, highlightKey, onHighlight }: Props) {
  return (
    <div className="font-mono text-xs">
      <TreeNodeRow
        node={tree}
        depth={0}
        refMap={refMap}
        highlightKey={highlightKey}
        onHighlight={onHighlight}
      />
    </div>
  )
}
