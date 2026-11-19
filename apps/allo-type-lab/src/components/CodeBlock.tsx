import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

type CodeBlockProps = {
  code: string
  label?: string
}

export function CodeBlock({ code, label = "Copy CSS snippet" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Output</p>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          <span>{copied ? "Copied" : label}</span>
        </Button>
      </div>
      <pre className="bg-muted/60 overflow-x-auto rounded-md border border-border p-3 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}