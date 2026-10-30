import { useRef, type CSSProperties } from 'react'
import { DottyBotty, type DottyBottyHandle, type StateName } from 'dotty-botty'
import { SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { DottyVisualOptions } from '@/components/dotty-types'

interface DottyStageProps {
  state: StateName
  options: DottyVisualOptions
  onPoke: () => void
}

export function DottyStage({ state, options, onPoke }: DottyStageProps) {
  const dottyRef = useRef<DottyBottyHandle>(null)

  return (
    <Card className="dotty-theme flex flex-col items-center">
      <CardHeader className="w-full text-center">
        <CardTitle className="inline-flex items-center justify-center gap-2">
          <SparklesIcon />
          Dotty
        </CardTitle>
        <CardDescription>
          Poke the mascot or use Boop / Blink. Eyes follow your pointer across
          the page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-8">
        <div
          className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6"
          style={
            {
              '--dotty-ink': options.ink,
              '--dotty-spot': options.spot,
            } as CSSProperties
          }
        >
          <DottyBotty
            ref={dottyRef}
            state={state}
            shape={options.shape}
            expression={options.expression}
            size={options.size}
            ink={options.ink}
            spot={options.spot}
            followPointer={options.followPointer}
            reducedMotion={options.reducedMotion}
            label="Simulated agent mascot"
            pokeable
            onPoke={onPoke}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => dottyRef.current?.poke()}
          >
            Boop
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => dottyRef.current?.blink()}
          >
            Blink
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
