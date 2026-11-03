import { MoonIcon, SunIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: 'https://x.com/foodofthegods3/status/2116423919137632431', label: 'Release (X)' },
  { href: 'https://x.com/foodofthegods3/status/2115800524591169623', label: 'Original (X)' },
  { href: 'https://github.com/lauriparonen/alembic-ornaments', label: 'GitHub' },
  { href: 'https://www.npmjs.com/package/@lauriparonen/alembic-ornaments', label: 'npm' },
  { href: 'https://alembic.space/ornaments', label: 'Playground' },
] as const

interface StudioHeaderProps {
  dark: boolean
  onToggleTheme: () => void
}

export function StudioHeader({ dark, onToggleTheme }: StudioHeaderProps) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            Unofficial community demo · Not affiliated with Lauri Paronen or Alembic
          </p>
          <h1 className="font-heading text-lg font-semibold tracking-tight">Alembic Ornament Studio</h1>
          <p className="text-xs text-muted-foreground">
            Ornaments by alembic-ornaments (Lauri Paronen, MIT)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex flex-wrap gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Button variant="outline" size="icon-sm" onClick={onToggleTheme} aria-label="Toggle theme">
            {dark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </div>
    </header>
  )
}
