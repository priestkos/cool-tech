import type { JotterState } from "./jotter-model"
import { selectedNote, visibleNotes } from "./jotter-model"
import { snapshotIdFromCounter } from "./snapshot-id"
import type { RefMapEntry, TreeNode } from "./types"

const INTERACTIVE_ROLES = new Set([
  "button",
  "textfield",
  "textarea",
  "checkbox",
  "listitem",
  "treeitem",
])

export function isAddressable(role: TreeNode["role"]): boolean {
  return INTERACTIVE_ROLES.has(role)
}

interface BuildOptions {
  interactiveOnly: boolean
  compact: boolean
}

interface BuildResult {
  tree: TreeNode
  refMap: Map<string, RefMapEntry>
  refCount: number
}

function nodeStates(states: string[]): string[] | undefined {
  return states.length ? states : undefined
}

function buildRawTree(state: JotterState): TreeNode {
  const note = selectedNote(state)
  const folders = state.folders
  const notes = visibleNotes(state)

  const folderItems: TreeNode[] = folders.map((f) => ({
    role: "treeitem",
    name: f.name,
    element_key: `folder-${f.id}`,
    states: f.id === state.selectedFolderId ? ["selected", "focused"] : ["enabled"],
    available_actions: ["select"],
  }))

  const noteItems: TreeNode[] = notes.map((n) => ({
    role: "listitem",
    name: n.title || "Untitled",
    element_key: `note-${n.id}`,
    states:
      n.id === state.selectedNoteId
        ? ["selected", "focused"]
        : n.pinned
          ? ["enabled", "pinned"]
          : ["enabled"],
    available_actions: ["select"],
  }))

  const pinChecked = note?.pinned ?? false

  return {
    role: "window",
    name: "Jotter",
    element_key: "window-jotter",
    children: [
      {
        role: "group",
        name: "Sidebar",
        element_key: "group-sidebar",
        children: [
          {
            role: "list",
            name: "Folders",
            element_key: "list-folders",
            children: folderItems,
          },
        ],
      },
      {
        role: "group",
        name: "Main",
        element_key: "group-main",
        children: [
          {
            role: "textfield",
            name: "Search notes",
            element_key: "field-search",
            states: state.searchQuery ? ["focused", "enabled"] : ["enabled"],
            available_actions: ["set-value", "type", "clear"],
          },
          {
            role: "list",
            name: "Notes",
            element_key: "list-notes",
            children: noteItems,
          },
          {
            role: "group",
            name: "Toolbar",
            element_key: "group-toolbar",
            children: [
              {
                role: "button",
                name: "New",
                element_key: "btn-new",
                states: ["enabled"],
                available_actions: ["click"],
              },
              {
                role: "button",
                name: "Delete",
                element_key: "btn-delete",
                states: note ? ["enabled"] : ["disabled"],
                available_actions: ["click"],
              },
              {
                role: "button",
                name: "Share",
                element_key: "btn-share",
                states: note ? ["enabled"] : ["disabled"],
                available_actions: ["click"],
              },
            ],
          },
          {
            role: "textfield",
            name: "Note title",
            element_key: "field-title",
            states: note ? ["enabled"] : ["disabled"],
            available_actions: note ? ["set-value", "type", "clear"] : [],
          },
          {
            role: "textarea",
            name: "Note body",
            element_key: "field-body",
            states: note ? ["enabled"] : ["disabled"],
            available_actions: note ? ["set-value", "type", "clear"] : [],
          },
          {
            role: "checkbox",
            name: "Pin note",
            element_key: "checkbox-pin",
            states: pinChecked ? ["checked", "enabled"] : ["enabled"],
            available_actions: ["toggle", "check", "uncheck", "click"],
          },
        ],
      },
    ],
  }
}

function isEmptyWrapper(node: TreeNode): boolean {
  if (node.role !== "group" && node.role !== "list") return false
  if (node.ref_id) return false
  if (!node.children?.length) return true
  return node.children.every((c) => c.role === "group" || c.role === "list")
}

function filterCompact(node: TreeNode): TreeNode | null {
  const children = node.children
    ?.map((c) => filterCompact(c))
    .filter((c): c is TreeNode => c !== null)
  const next: TreeNode = { ...node, children }
  if (isEmptyWrapper(next)) return null
  if (next.children?.length === 0 && !next.ref_id && next.role === "group") {
    return null
  }
  return next
}

function filterInteractive(node: TreeNode): TreeNode | null {
  const selfInteractive = isAddressable(node.role)
  const children = node.children
    ?.map((c) => filterInteractive(c))
    .filter((c): c is TreeNode => c !== null)

  if (selfInteractive) {
    return { ...node, children: children?.length ? children : undefined }
  }
  if (children?.length) {
    if (children.length === 1 && node.role === "group") {
      return children[0]
    }
    return { ...node, children, name: node.name || node.role }
  }
  return null
}

function assignRefs(
  node: TreeNode,
  snapshotId: string,
  refMap: Map<string, RefMapEntry>,
  counter: { n: number },
): TreeNode {
  let ref_id: string | undefined
  if (isAddressable(node.role) && node.element_key) {
    counter.n += 1
    ref_id = `@${snapshotId}:e${counter.n}`
    refMap.set(ref_id, {
      elementKey: node.element_key,
      role: node.role,
      name: node.name,
    })
  }
  const children = node.children?.map((c) => assignRefs(c, snapshotId, refMap, counter))
  const out: TreeNode = { ...node, ref_id, children }
  delete out.element_key
  return out
}

export function buildSnapshotTree(
  state: JotterState,
  snapshotCounter: number,
  options: BuildOptions,
): BuildResult & { snapshotId: string } {
  const snapshotId = snapshotIdFromCounter(snapshotCounter)
  let tree = buildRawTree(state)
  if (options.compact) {
    const filtered = filterCompact(tree)
    tree = filtered ?? tree
  }
  if (options.interactiveOnly) {
    const filtered = filterInteractive(tree)
    tree = filtered ?? tree
  }
  const refMap = new Map<string, RefMapEntry>()
  const counter = { n: 0 }
  tree = assignRefs(tree, snapshotId, refMap, counter)
  return {
    tree,
    refMap,
    refCount: counter.n,
    snapshotId,
  }
}

export function findInTree(
  node: TreeNode,
  role?: string,
  name?: string,
  exact?: boolean,
): TreeNode[] {
  const matches: TreeNode[] = []
  const roleMatch = role ? node.role === normalizeRole(role) : true
  const nameMatch = name
    ? exact
      ? node.name.toLowerCase() === name.toLowerCase()
      : node.name.toLowerCase().includes(name.toLowerCase())
    : true
  if (roleMatch && nameMatch && (role || name)) {
    matches.push(node)
  }
  for (const child of node.children ?? []) {
    matches.push(...findInTree(child, role, name, exact))
  }
  return matches
}

function normalizeRole(role: string): TreeNode["role"] {
  const r = role.toLowerCase()
  if (r === "textbox" || r === "searchfield") return "textfield"
  return r as TreeNode["role"]
}

export function stripInternalKeys(node: TreeNode): TreeNode {
  const { element_key: _ek, ...rest } = node as TreeNode & { element_key?: string }
  return {
    ...rest,
    children: rest.children?.map(stripInternalKeys),
  }
}

export function nodeStatesForExport(states: string[] | undefined): string[] | undefined {
  return nodeStates(states ?? [])
}
