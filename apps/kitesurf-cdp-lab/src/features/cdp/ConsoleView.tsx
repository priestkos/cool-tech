import type { ConsoleLine } from "@/cdp/types"
import { Badge } from "@/components/ui/badge"

export function ConsoleView({ lines }: { lines: ConsoleLine[] }) {
  if (!lines.length) {
    return (
      <p className="text-muted-foreground text-xs">No Runtime.consoleAPICalled events yet.</p>
    )
  }

  return (
    <ul className="space-y-2" aria-label="Console output from CDP events">
      {lines.map((line, i) => (
        <li key={`${line.atMs}-${i}`} className="flex gap-2 text-xs">
          <Badge variant="outline" className="shrink-0 uppercase">
            {line.type}
          </Badge>
          <span className="font-mono text-[0.7rem] leading-relaxed">{line.text}</span>
        </li>
      ))}
    </ul>
  )
}