import { useMemo } from 'react'
import { Stage, type Script, type StageProps } from '@stageshow/kit'
import { StillContext } from '@stageshow/kit/reduced-motion'

import type { MomentViewMode } from './moment-view'

export type MomentStageShellProps<S extends object> = {
  width: number
  height: number
  compact?: { below: number; width: number; height: number }
  initial: S
  poster: S
  script?: Script<S>
  mode: MomentViewMode
  playKey: number
  forceStill: boolean
  className?: string
  cursor?: StageProps<S>['cursor']
  fill?: boolean
  children: StageProps<S>['children']
}

export function MomentStageShell<S extends object>({
  width,
  height,
  compact,
  initial,
  poster,
  script,
  mode,
  playKey,
  forceStill,
  className,
  cursor,
  fill,
  children,
}: MomentStageShellProps<S>) {
  const running = mode === 'play' && script && !forceStill

  const shown = useMemo(() => {
    if (mode === 'before') return initial
    if (mode === 'after') return poster
    return initial
  }, [initial, mode, poster])

  return (
    <StillContext.Provider value={forceStill}>
      <Stage<S>
        key={running ? `play-${playKey}` : `still-${mode}`}
        width={width}
        height={height}
        compact={compact}
        initial={shown}
        poster={poster}
        script={running ? script : undefined}
        play={running ? 'once' : undefined}
        cursor={running ? cursor : mode === 'before' ? cursor : undefined}
        className={className}
        fill={fill}
      >
        {children}
      </Stage>
    </StillContext.Provider>
  )
}