import { movedTo, reorderMessage } from "@/sdk/reorder"
import { useCallback, useState } from "react"
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
  const [items, setItems] = useState(TASK_ITEMS)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const onDrop = useCallback(
    (toIndex: number) => {
      if (dragIndex === null) return
      const keys = items.map((i) => i.id)
      const nextKeys = movedTo(keys, keys[dragIndex], toIndex)
      const next = nextKeys.map(
        (id) => items.find((i) => i.id === id)!,
      )
      setItems(next)
      const moved = items[dragIndex]
      const position = nextKeys.indexOf(moved.id) + 1
      onAnnounce(
        reorderMessage({
          type: "drop",
          key: moved.id,
          label: moved.label,
          count: 1,
          position,
          total: next.length,
        }),
      )
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
      <p className="text-[0.65rem] text-muted-foreground">
        Order commits with @ui-sdk/core <code className="text-[0.6rem]">movedTo</code>
        ; announcements use <code className="text-[0.6rem]">reorderMessage</code>.
      </p>
    </div>
  )
}