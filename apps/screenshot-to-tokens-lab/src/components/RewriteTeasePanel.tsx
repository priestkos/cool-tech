import type { RewriteExample } from "@/lib/fixtures/types"

type Props = {
  examples: RewriteExample[]
}

export function RewriteTeasePanel({ examples }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="font-medium">CSS rewrite tease</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Static fixture examples — not a real stylesheet rewriter.
      </p>
      <ul className="space-y-2 font-mono text-xs">
        {examples.map((ex) => (
          <li key={ex.before} className="rounded-lg border bg-muted/40 p-2">
            <div className="text-muted-foreground line-through">{ex.before}</div>
            <div className="text-foreground">{ex.after}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
