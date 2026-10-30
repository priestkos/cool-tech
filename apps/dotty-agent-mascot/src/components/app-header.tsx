import { ExternalLinkIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Dotty Agent Mascot
          </h1>
          <Badge variant="secondary">dotty-botty 1.0.0</Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Playground for{' '}
          <a
            className="text-foreground underline underline-offset-4"
            href="https://dotty.roybarber.com"
            rel="noreferrer"
            target="_blank"
          >
            Dotty
          </a>
          , a tiny procedural SVG mascot for agents and generative UI. The chat
          console below is <strong>simulated</strong> — no LLM, no API keys.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            href="https://github.com/roybarber/dotty-botty"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
            <ExternalLinkIcon data-icon="inline-end" />
          </a>
          <a
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            href="https://x.com/roybarberuk/status/2115056957933445564"
            rel="noreferrer"
            target="_blank"
          >
            Launch post
            <ExternalLinkIcon data-icon="inline-end" />
          </a>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
        }
      >
        {resolvedTheme === 'dark' ? (
          <>
            <SunIcon data-icon="inline-start" />
            Light
          </>
        ) : (
          <>
            <MoonIcon data-icon="inline-start" />
            Dark
          </>
        )}
      </Button>
    </header>
  )
}
