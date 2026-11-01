export const ENVELOPE_VERSION = "2.5"

export type A11yRole =
  | "window"
  | "group"
  | "list"
  | "listitem"
  | "treeitem"
  | "button"
  | "textfield"
  | "textarea"
  | "checkbox"
  | "statictext"

export type Delivery =
  | "unknown"
  | "not_delivered"
  | "delivery_uncertain"
  | "delivered_unverified"
  | "delivered_verified"

export type RetryDisposition = "unknown" | "safe" | "unsafe"

export interface Disposition {
  delivery: Delivery
  retry: RetryDisposition
}

export interface TreeNode {
  role: A11yRole
  name: string
  ref_id?: string
  states?: string[]
  available_actions?: string[]
  children?: TreeNode[]
  /** Internal simulator key for highlight mapping */
  element_key?: string
}

export interface SnapshotData {
  app: string
  window: { id: string; title: string }
  snapshot_id: string
  ref_count: number
  complete: boolean
  tree: TreeNode
}

export interface SuccessEnvelope<T> {
  version: string
  ok: true
  command: string
  data: T
}

export interface ErrorEnvelope {
  version: string
  ok: false
  command: string
  error: {
    code: string
    message: string
    suggestion?: string
    recovery?: {
      strategy: string
      retryable: boolean
      requires_fresh_snapshot?: boolean
    }
    disposition: Disposition
  }
}

export type Envelope<T = unknown> = SuccessEnvelope<T> | ErrorEnvelope

export interface RefMapEntry {
  elementKey: string
  role: A11yRole
  name: string
}

export interface ParsedCommand {
  raw: string
  command: string
  args: string[]
  flags: Record<string, string | boolean>
  agentId?: string
}
