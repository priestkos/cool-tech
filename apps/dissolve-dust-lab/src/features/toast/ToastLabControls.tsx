import { useRef } from "react"
import { useToast } from "@/components/dissolve/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InboxItem } from "@/features/archive"

type Props = {
  inbox: InboxItem[]
  onRemoveFirst: () => InboxItem | null
  onRestore: (item: InboxItem) => void
}

export function ToastLabControls({ inbox, onRemoveFirst, onRestore }: Props) {
  const toast = useToast()
  const pendingUndo = useRef<InboxItem | null>(null)
  const toastSeq = useRef(0)

  const showWithUndo = () => {
    const removed = onRemoveFirst()
    pendingUndo.current = removed
    toastSeq.current += 1
    toast.show({
      title: `Draft saved #${toastSeq.current}`,
      message: "Leaves as dust — Undo restores the inbox row.",
      action: {
        label: "Undo",
        onPress: () => {
          if (pendingUndo.current) {
            onRestore(pendingUndo.current)
            pendingUndo.current = null
          }
        },
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="font-heading text-lg">Toast + Undo</CardTitle>
          <Badge variant="outline">exit: dust</Badge>
        </div>
        <CardDescription>
          Grains on enter/leave via toast.core; Undo uses the real{" "}
          <code className="text-xs">action.onPress</code> API.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button type="button" onClick={showWithUndo} disabled={inbox.length === 0}>
          Show toast (removes top inbox row)
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            toast.show({
              title: "Saved offline",
              message: "No network — canvas engine only.",
              tone: "success",
            })
          }
        >
          Success toast
        </Button>
        <p className="text-muted-foreground w-full text-xs">
          Inbox rows: {inbox.length}. Toast stack is fixed at top via{" "}
          <code className="text-xs">ToastProvider</code>.
        </p>
      </CardContent>
    </Card>
  )
}