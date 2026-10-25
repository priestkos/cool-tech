// Ported from glass-icon-reveal (MIT) — https://github.com/zanwei/glass-icon-reveal

import type { LogoTextures } from '@/glass/sdf'

interface StaticGlassFallbackProps {
  logo: LogoTextures | null
  background: string
  className?: string
  onDoubleClick?: () => void
}

export function StaticGlassFallback({
  logo,
  background,
  className,
  onDoubleClick,
}: StaticGlassFallbackProps) {
  const src = logo?.canvas.toDataURL('image/png')

  return (
    <div
      className={className}
      style={{ background }}
      onDoubleClick={onDoubleClick}
      role="img"
      aria-label="Static glass preview"
    >
      <div className="flex h-full w-full items-center justify-center p-8">
        <div
          className="relative flex h-48 w-48 items-center justify-center rounded-[2rem] border border-white/30 bg-white/20 shadow-lg backdrop-blur-xl"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.35)' }}
        >
          {src ? (
            <img src={src} alt="Logo" className="max-h-[55%] max-w-[55%] object-contain" />
          ) : (
            <span className="text-muted-foreground text-sm">Loading logo…</span>
          )}
        </div>
      </div>
    </div>
  )
}
