import { useCallback, useId, useState } from "react"
import { formatReorderAnnouncement } from "@/behaviors/live-region"
import { moveItemInList } from "@/behaviors/sortable"
import { TASK_ITEMS } from "@/lib/fixtures"
import { cn } from "@/lib/utils"

type SortableTaskListProps = {
  onAnnounce: (text: string) => void
  onInspectTarget?: (el: HTMLElement | null) => void
}

export function SortableTaskList({
  onAnnounce,
  onInspectTarget,
}: SortableTaskListProps) {
  const liveId = useId()
  const [items, setItems] = useState(TASK_ITEMS)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const onDrop = useCallback(
    (toIndex: number) => {
      if (dragIndex === null) return
      const next = moveItemInList(items, dragIndex, toIndex)
      setItems(next)
      const moved = items[dragIndex]
      onAnnounce(formatReorderAnnouncement(moved.label, dragIndex, toIndex))
      setDragIndex(null)
    },
    [dragIndex, items, onAnnounce],
  )

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">Sortable list (drag handles)</p>
      <ul
        role="list"
        className="space-y-1 rounded-md border border-border bg-card p-2"
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(index)}
            onFocus={(e) => onInspectTarget?.(e.currentTarget)}
            tabIndex={0}
            className={cn(
              "flex items-center gap-2 rounded-sm border border-transparent px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              dragIndex === index && "opacity-60",
            )}
          >
            <span
              aria-hidden
              className="cursor-grab select-none text-muted-foreground"
            >
              ⠿
            </span>
            {item.label}
          </li>
        ))}
      </ul>
      <div
        id={liveId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <p className="text-[0.65rem] text-muted-foreground">
        Moves are duplicated in the announcement log panel.
      </p>
    </div>
  )
}
