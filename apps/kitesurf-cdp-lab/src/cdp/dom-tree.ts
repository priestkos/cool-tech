import type { DomNode } from "./types"

type RawDomNode = {
  nodeId: number
  parentId?: number
  backendNodeId?: number
  nodeType: number
  nodeName: string
  localName?: string
  nodeValue?: string
  childNodeCount?: number
  children?: RawDomNode[]
  attributes?: string[]
}

export type DomTreeNode = {
  id: number
  name: string
  value?: string
  attributes: Record<string, string>
  children: DomTreeNode[]
}

export function parseAttributePairs(attributes?: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  if (!attributes) return out
  for (let i = 0; i < attributes.length; i += 2) {
    const key = attributes[i]
    const val = attributes[i + 1]
    if (key !== undefined && val !== undefined) out[key] = val
  }
  return out
}

export function buildDomTreeFromDocument(
  root: RawDomNode | DomNode | undefined
): DomTreeNode | null {
  if (!root) return null

  const walk = (node: RawDomNode): DomTreeNode => ({
    id: node.nodeId,
    name: node.localName && node.localName.length > 0 ? node.localName : node.nodeName,
    value: node.nodeValue || undefined,
    attributes: parseAttributePairs(node.attributes),
    children: (node.children ?? []).map(walk),
  })

  return walk(root as RawDomNode)
}

export function flattenDomTree(root: DomTreeNode | null, depth = 0): string[] {
  if (!root) return []
  const indent = "  ".repeat(depth)
  const attr = Object.entries(root.attributes)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ")
  const head = `${indent}<${root.name}${attr ? ` ${attr}` : ""}>${root.value ?? ""}`
  return [head, ...root.children.flatMap((c) => flattenDomTree(c, depth + 1))]
}