import { DottyBotty, SHAPE_NAMES, type ShapeName, type StateName } from 'dotty-botty'
import type { CSSProperties } from 'react'
import type { DottyVisualOptions } from '@/components/dotty-types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ShapeGalleryProps {
  state: StateName
  selectedShape: ShapeName
  options: DottyVisualOptions
  onSelectShape: (shape: ShapeName) => void
}

export function ShapeGallery({
  state,
  selectedShape,
  options,
  onSelectShape,
}: ShapeGalleryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shape gallery</CardTitle>
        <CardDescription>
          All 27 outlines in the current colors and state. Click to morph the
          hero Dotty.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="dotty-theme grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9"
          style={
            {
              '--dotty-ink': options.ink,
              '--dotty-spot': options.spot,
            } as CSSProperties
          }
        >
          {SHAPE_NAMES.map((shape) => (
            <button
              key={shape}
              type="button"
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border border-transparent p-2 transition-colors hover:bg-muted/60',
                selectedShape === shape && 'border-primary bg-muted/80',
              )}
              onClick={() => onSelectShape(shape)}
            >
              <DottyBotty
                shape={shape}
                state={state}
                expression={options.expression}
                size={52}
                ink={options.ink}
                spot={options.spot}
                followPointer={false}
                reducedMotion={options.reducedMotion}
              />
              <span className="text-[10px] text-muted-foreground">{shape}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
