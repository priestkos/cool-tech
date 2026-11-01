import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FULLSCREEN_ESTIMATE_SIZE,
  TOKEN_ESTIMATE_SOURCES,
} from "@/lib/tokens"
import { cn } from "@/lib/utils"
import type { ConsoleEntry } from "@/hooks/useLabState"

interface Props {
  entries: ConsoleEntry[]
}

export function CommandConsole({ entries }: Props) {
  return (
    <ScrollArea className="h-64 rounded-md border bg-zinc-950 p-2">
      <div className="space-y-3 font-mono text-[11px]">
        {entries.length === 0 ? (
          <p className="text-zinc-500">Console output appears here.</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="border-b border-zinc-800 pb-2 last:border-0">
              {e.label ? (
                <p className="mb-1 text-zinc-400">{e.label}</p>
              ) : null}
              <p className="text-sky-300">$ {e.cli}</p>
              <pre
                className={cn(
                  "mt-1 whitespace-pre-wrap break-all",
                  e.envelope.ok ? "text-emerald-300" : "text-rose-300",
                )}
              >
                {JSON.stringify(e.envelope)}
              </pre>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

interface MeterProps {
  treeTotal: number
  imageTotal: number
  ratio: string
  windowWidth: number
  windowHeight: number
  fullscreenEstimate: boolean
  onToggleFullscreen: (v: boolean) => void
}

export function TokenMeterPanel({
  treeTotal,
  imageTotal,
  ratio,
  windowWidth,
  windowHeight,
  fullscreenEstimate,
  onToggleFullscreen,
}: MeterProps) {
  const imgW = fullscreenEstimate ? FULLSCREEN_ESTIMATE_SIZE.width : windowWidth
  const imgH = fullscreenEstimate ? FULLSCREEN_ESTIMATE_SIZE.height : windowHeight
  return (
    <div className="space-y-2 rounded-md border p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">Token meter (estimates)</h3>
        <Badge variant="outline">not measurements</Badge>
        <Popover>
          <PopoverTrigger className="inline-flex h-7 items-center rounded-md border px-2 text-xs hover:bg-muted">
            How we estimate
          </PopoverTrigger>
          <PopoverContent className="max-w-sm text-xs leading-relaxed">
            <p className="mb-2 font-medium">These are estimates for this mock window, not measurements of agent-desktop.</p>
            <p className="mb-1">
              <strong>Tree read:</strong> {TOKEN_ESTIMATE_SOURCES.text}
            </p>
            <p>
              <strong>Screenshot read:</strong> {TOKEN_ESTIMATE_SOURCES.image}
            </p>
          </PopoverContent>
        </Popover>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Tree reads (running total)</dt>
          <dd className="font-mono text-lg">{treeTotal} est. tokens</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            Screenshot reads ({imgW}×{imgH}px)
          </dt>
          <dd className="font-mono text-lg">{imageTotal} est. tokens</dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">{ratio}</p>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={fullscreenEstimate}
          onChange={(e) => onToggleFullscreen(e.target.checked)}
        />
        Compare against typical full screen ({FULLSCREEN_ESTIMATE_SIZE.width}×
        {FULLSCREEN_ESTIMATE_SIZE.height})
      </label>
    </div>
  )
}
