import { Check, GitMerge, Pencil } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { FixturePack, TokenRecord } from "@/lib/fixtures/types"
import { resolveTokens } from "@/lib/token-cascade"

type Props = {
  fixture: FixturePack
  overrides: Record<string, string>
  onPrimitiveChange: (id: string, value: string) => void
  onMetaToggle: (id: string, field: "accepted" | "merged") => void
  onRename: (id: string, name: string) => void
  visible: boolean
}

function TierSection({
  title,
  records,
  resolved,
  onPrimitiveChange,
  onMetaToggle,
  onRename,
}: {
  title: string
  records: TokenRecord[]
  resolved: Map<string, string>
  onPrimitiveChange: (id: string, value: string) => void
  onMetaToggle: (id: string, field: "accepted" | "merged") => void
  onRename: (id: string, name: string) => void
}) {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-3">
          {records.map((token) => {
            const resolvedValue = resolved.get(token.id) ?? token.value
            return (
              <li key={token.id} className="rounded-lg border p-3 text-sm">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Input
                    className="h-8 max-w-[180px] font-mono text-xs"
                    value={token.name}
                    onChange={(e) => onRename(token.id, e.target.value)}
                  />
                  {token.accepted ? (
                    <Badge variant="secondary">accepted</Badge>
                  ) : (
                    <Badge variant="outline">pending</Badge>
                  )}
                  {token.merged ? <Badge variant="outline">merged</Badge> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {token.tier === "primitive" ? (
                    <Input
                      className="h-8 max-w-[140px] font-mono text-xs"
                      value={token.value}
                      onChange={(e) => onPrimitiveChange(token.id, e.target.value)}
                    />
                  ) : (
                    <code className="rounded bg-muted px-2 py-1 text-xs">{token.value}</code>
                  )}
                  <span className="text-xs text-muted-foreground">→ {resolvedValue}</span>
                  {/^#/.test(resolvedValue) ? (
                    <span
                      className="size-5 rounded border"
                      style={{ background: resolvedValue }}
                      aria-hidden
                    />
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{token.reason}</p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMetaToggle(token.id, "accepted")}
                  >
                    <Check className="size-3.5" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMetaToggle(token.id, "merged")}
                  >
                    <GitMerge className="size-3.5" /> Merge
                  </Button>
                  <Button size="sm" variant="ghost" disabled>
                    <Pencil className="size-3.5" /> Rename
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </AccordionContent>
    </AccordionItem>
  )
}

export function TokenTreePanel({
  fixture,
  overrides,
  onPrimitiveChange,
  onMetaToggle,
  onRename,
  visible,
}: Props) {
  if (!visible) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        Token tree hidden until mock extraction completes.
      </div>
    )
  }

  const resolved = resolveTokens(fixture, overrides)

  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="font-medium">Three-tier token tree</h2>
        <p className="text-xs text-muted-foreground">
          Primitive → semantic → component. Edit primitives to cascade aliases.
        </p>
      </div>
      <ScrollArea className="h-[420px]">
        <Accordion defaultValue={["Primitive", "Semantic", "Component"]} className="px-4">
          <TierSection
            title="Primitive"
            records={fixture.primitives}
            resolved={resolved.byId}
            onPrimitiveChange={onPrimitiveChange}
            onMetaToggle={onMetaToggle}
            onRename={onRename}
          />
          <TierSection
            title="Semantic"
            records={fixture.semantic}
            resolved={resolved.byId}
            onPrimitiveChange={onPrimitiveChange}
            onMetaToggle={onMetaToggle}
            onRename={onRename}
          />
          <TierSection
            title="Component"
            records={fixture.component}
            resolved={resolved.byId}
            onPrimitiveChange={onPrimitiveChange}
            onMetaToggle={onMetaToggle}
            onRename={onRename}
          />
        </Accordion>
      </ScrollArea>
    </div>
  )
}
