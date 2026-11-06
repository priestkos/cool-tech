import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { CSSProperties } from "react"

type Props = {
  cssVariables: Record<string, string>
  dark: boolean
  onDarkChange: (value: boolean) => void
  highlightFailing?: boolean
  failingPairIds: Set<string>
}

export function PreviewPanel({
  cssVariables,
  dark,
  onDarkChange,
  highlightFailing,
  failingPairIds,
}: Props) {
  const style = cssVariables as CSSProperties
  const failBodyOnCard = highlightFailing && failingPairIds.has("body-on-card")

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-medium">Live preview</h2>
          <p className="text-xs text-muted-foreground">Dashboard-ish UI driven by token CSS variables.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span>Dark mode</span>
          <Switch checked={dark} onCheckedChange={onDarkChange} />
        </label>
      </div>
      <div
        className={`overflow-hidden rounded-xl border ${dark ? "dark" : ""}`}
        style={{
          ...style,
          background: "var(--preview-canvas)",
          color: "var(--preview-text)",
          borderRadius: "var(--preview-radius, 12px)",
        }}
      >
        <div className="flex min-h-[260px]">
          <aside
            className="w-28 shrink-0 p-3 text-xs"
            style={{
              background: "var(--preview-sidebar-bg)",
              color: "var(--preview-text)",
            }}
          >
            <div className="mb-4 font-semibold opacity-80">Nav</div>
            <ul className="space-y-2 opacity-70">
              <li>Overview</li>
              <li>Reports</li>
              <li>Settings</li>
            </ul>
          </aside>
          <div className="flex flex-1 flex-col gap-3 p-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                style={{
                  background: "var(--preview-button-bg)",
                  color: "#fff",
                  borderRadius: "var(--preview-radius, 8px)",
                }}
              >
                Primary action
              </Button>
              <Button size="sm" variant="outline">
                Secondary
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card
                className={failBodyOnCard ? "ring-2 ring-destructive" : ""}
                style={{
                  background: "var(--preview-card-bg)",
                  color: "var(--preview-text)",
                  borderRadius: "var(--preview-radius, 10px)",
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Active users</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">12.4k</CardContent>
              </Card>
              <Card
                style={{
                  background: "var(--preview-card-bg)",
                  color: "var(--preview-text)",
                  borderRadius: "var(--preview-radius, 10px)",
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Conversion</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold" style={{ color: "var(--preview-accent)" }}>
                  3.8%
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
