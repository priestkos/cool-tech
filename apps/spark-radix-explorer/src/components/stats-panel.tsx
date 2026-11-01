import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { BackendPreference } from "@/lib/stats"
import { backendPreferenceLabel } from "@/lib/stats"
import type { ViewerStatsSnapshot } from "@/components/splat-viewport"

const BACKEND_OPTIONS: BackendPreference[] = ["auto", "webgpu", "webgpu-gl"]

interface StatsPanelProps {
  stats: ViewerStatsSnapshot
  backendPreference: BackendPreference
  onBackendPreference: (value: BackendPreference) => void
}

export function StatsPanel({
  stats,
  backendPreference,
  onBackendPreference,
}: StatsPanelProps) {
  return (
    <Card className="pointer-events-auto border-border/60 bg-background/90 shadow-lg backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Live stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
          <dt className="text-muted-foreground">Splats</dt>
          <dd className="font-mono text-right">{stats.splatCount?.toLocaleString("en-US") ?? "—"}</dd>
          <dt className="text-muted-foreground">Frame time (CPU)</dt>
          <dd className="font-mono text-right">
            {stats.frameMsLabel}{" "}
            <span className="text-muted-foreground">({stats.frameFpsLabel})</span>
          </dd>
          <dt className="text-muted-foreground">GPU backend</dt>
          <dd className="text-right text-xs leading-snug">{stats.backendLabel}</dd>
        </dl>
        <div className="space-y-1.5">
          <Label htmlFor="backend-select">Renderer backend</Label>
          <Select
            value={backendPreference}
            onValueChange={(value) => onBackendPreference(value as BackendPreference)}
          >
            <SelectTrigger id="backend-select" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BACKEND_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {backendPreferenceLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Recreates the renderer. The label above reflects{" "}
            <code className="text-[10px]">getGpuCaps(renderer).backend</code>.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
