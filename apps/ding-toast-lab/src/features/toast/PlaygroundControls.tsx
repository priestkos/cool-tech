import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { SampleItem } from "./model"

type Props = {
  motionEnabled: boolean
  onMotionChange: (value: boolean) => void
  onSuccess: () => void
  onError: () => void
  onPromiseResolve: () => void
  onPromiseReject: () => void
  onProgress: () => void
  onArchiveUndo: () => void
  onInterrupt: () => void
  onDismiss: () => void
  items: SampleItem[]
}

export function PlaygroundControls({
  motionEnabled,
  onMotionChange,
  onSuccess,
  onError,
  onPromiseResolve,
  onPromiseReject,
  onProgress,
  onArchiveUndo,
  onInterrupt,
  onDismiss,
  items,
}: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base tracking-tight">Status morphs</CardTitle>
          <CardDescription>One toast updates in place — no stacking duplicates.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" onClick={onSuccess}>
            Success
          </Button>
          <Button type="button" variant="destructive" onClick={onError}>
            Error
          </Button>
          <Button type="button" variant="outline" onClick={onDismiss}>
            Dismiss / reset
          </Button>
          <Button type="button" variant="secondary" onClick={onInterrupt}>
            Rapid interrupt
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base tracking-tight">Promise fixtures</CardTitle>
          <CardDescription>Deterministic timers with stale-completion guards.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onPromiseResolve}>
            Resolve promise
          </Button>
          <Button type="button" variant="outline" onClick={onPromiseReject}>
            Reject promise
          </Button>
          <Button type="button" onClick={onProgress}>
            Progress upload
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base tracking-tight">Undo demo</CardTitle>
          <CardDescription>
            Archive mutates the sample list below; Undo on the toast restores the item.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" onClick={onArchiveUndo}>
            Archive next item
          </Button>
          <ul className="grid gap-2 sm:grid-cols-3" aria-label="Sample documents">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm"
              >
                <span className={item.archived ? "text-muted-foreground line-through" : ""}>
                  {item.label}
                </span>
                {item.archived ? (
                  <span className="text-muted-foreground mt-1 block text-[0.65rem]">Archived</span>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base tracking-tight">Motion & access</CardTitle>
          <CardDescription>
            Respects <code className="text-xs">prefers-reduced-motion</code>; toggle spring morphs for
            comparison. Escape dismisses the toast.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Switch
            id="motion-toggle"
            checked={motionEnabled}
            onCheckedChange={onMotionChange}
            aria-label="Enable spring-like toast motion"
          />
          <Label htmlFor="motion-toggle">Spring morph motion</Label>
        </CardContent>
      </Card>
    </div>
  )
}
