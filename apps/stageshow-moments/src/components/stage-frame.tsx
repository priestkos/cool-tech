import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StageFrameProps = {
  children: ReactNode
  width: number
  className?: string
  compact?: boolean
}

/** 1:1 design canvas scaled to fit the tile picture slot. */
export function StageFrame({ children, width, className, compact }: StageFrameProps) {
  return (
    <div
      className={cn('stage-frame', compact && 'stage-frame--compact', className)}
      style={{ ['--stage-width' as string]: `${width}px` }}
    >
      <div className="stage-frame__canvas">{children}</div>
    </div>
  )
}

export function Bar({ className }: { className?: string }) {
  return <span className={cn('ui-bar', className)} aria-hidden />
}

export function InitialTile({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <span className={cn('initial-tile', className)} aria-hidden>
      {label.charAt(0)}
    </span>
  )
}
