import { GradientBorder } from '@/components/gradient-border'
import { GradientButton } from '@/components/gradient-button'
import { GradientCard } from '@/components/gradient-card'
import { GradientText } from '@/components/gradient-text'
import type { GradientProps } from '@/components/gradient-surface'

export function GallerySection({ gradientProps }: { gradientProps: GradientProps }) {
  return (
    <section className="border-t border-border/50 bg-background px-4 py-12 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">UI gallery</h2>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Gradient text, borders, buttons, and cards from the free MIT registry — wired to the
            same live controls as the hero.
          </p>
        </header>

        <div className="flex flex-col items-start gap-6 rounded-xl border border-border/60 bg-muted/20 p-6">
          <GradientText
            {...gradientProps}
            kind="mesh"
            className="text-4xl font-semibold tracking-tight md:text-5xl"
          >
            gradients.sh
          </GradientText>

          <div className="flex flex-wrap items-center gap-3">
            <GradientButton {...gradientProps} kind="mesh" size="md">
              Gradient button
            </GradientButton>
            <GradientButton {...gradientProps} kind="linear-flow" size="sm">
              Linear flow
            </GradientButton>
          </div>

          <GradientBorder {...gradientProps} kind="linear-flow" className="w-full max-w-md rounded-2xl p-[2px]">
            <div className="rounded-[calc(1rem-2px)] bg-background/90 px-5 py-4 text-sm">
              <p className="font-medium">Gradient border</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Animated ring with a transparent interior — good for cards and CTAs.
              </p>
            </div>
          </GradientBorder>

          <div className="grid w-full gap-4 md:grid-cols-2">
            <GradientCard {...gradientProps} kind="grain" className="min-h-[180px] rounded-2xl p-5">
              <p className="text-lg font-semibold text-white">Gradient card</p>
              <p className="mt-2 text-sm text-white/85">
                Live grain background with a scrim so white copy stays readable.
              </p>
            </GradientCard>
            <GradientCard {...gradientProps} kind="aurora" className="min-h-[180px] rounded-2xl p-5">
              <p className="text-lg font-semibold text-white">Aurora fill</p>
              <p className="mt-2 text-sm text-white/85">
                Swap the kind prop to try other shaders on the same card shell.
              </p>
            </GradientCard>
          </div>
        </div>
      </div>
    </section>
  )
}
