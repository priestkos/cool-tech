import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { Envelope } from "@/lib/types"
import { ChevronDown } from "lucide-react"

export function JsonEnvelopeViewer({ envelope }: { envelope: Envelope | undefined }) {
  if (!envelope) {
    return (
      <p className="text-xs text-muted-foreground">
        Run snapshot to see the JSON envelope.
      </p>
    )
  }
  const text = JSON.stringify(envelope, null, 2)
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs hover:bg-muted">
        <ChevronDown className="size-3" />
        JSON envelope
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="mt-2 max-h-48 overflow-auto rounded-md border bg-zinc-950 p-2 text-[10px] leading-relaxed text-emerald-100">
          {text}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  )
}
