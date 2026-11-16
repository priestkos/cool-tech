import type { DomTreeNode } from "@/cdp/dom-tree"

function NodeRow({ node, depth }: { node: DomTreeNode; depth: number }) {
  const attrs = Object.entries(node.attributes)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ")
  return (
  <>
    <div
      className="font-mono text-[0.65rem] leading-relaxed text-foreground/90"
      style={{ paddingLeft: depth * 12 }}
    >
      <span className="text-muted-foreground">&lt;{node.name}</span>
      {attrs ? <span className="text-primary/80"> {attrs}</span> : null}
      <span className="text-muted-foreground">&gt;</span>
      {node.value ? <span>{node.value}</span> : null}
    </div>
    {node.children.map((child) => (
      <NodeRow key={child.id} node={child} depth={depth + 1} />
    ))}
  </>
  )
}

export function DomTreeView({ tree }: { tree: DomTreeNode | null }) {
  if (!tree) {
    return (
      <p className="text-muted-foreground text-xs">
        Load a fixture page to hydrate DOM.getDocument.
      </p>
    )
  }

  return (
    <div
      className="max-h-64 overflow-auto rounded-md border border-border/60 bg-muted/30 p-2"
      role="tree"
      aria-label="DOM tree from CDP fixture"
    >
      {tree.children.map((child) => (
        <NodeRow key={child.id} node={child} depth={0} />
      ))}
    </div>
  )
}