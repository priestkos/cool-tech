export type DismissSignal = "escape" | "outside" | "none"

export function dismissSignalFromKey(key: string): DismissSignal {
  if (key === "Escape") return "escape"
  return "none"
}

export type NodeContainer = { contains(node: unknown): boolean }

export function shouldCloseOnOutsideClick(
  container: NodeContainer,
  target: unknown,
): boolean {
  if (target == null || typeof target !== "object") return false
  return !container.contains(target)
}
