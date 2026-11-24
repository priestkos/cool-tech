import { KoiPond, type KoiPondProps } from "@hxlfed/koipond"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { PondLook } from "./defaults"

type Props = {
  look: PondLook
  shareLook: boolean
  onShareLookChange: (share: boolean) => void
  baseProps: KoiPondProps
}

export function HeroPreview({ look, shareLook, onShareLookChange, baseProps }: Props) {
  const heroProps: KoiPondProps = {
    ...baseProps,
    look,
    fish: Math.min(baseProps.fish ?? 12, 8),
    interactive: false,
    scrollCurrent: false,
    border: true,
    rain: Math.min(baseProps.rain ?? 0.4, 0.35),
    style: { height: "100%" },
    className: "h-full w-full",
  }

  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <CardTitle className="font-heading text-lg">Hero embed</CardTitle>
          <CardDescription>
            Marketing-style band with live <code className="text-xs">KoiPond</code> (README hero
            pattern).
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="hero-share-look"
            checked={shareLook}
            onCheckedChange={onShareLookChange}
            aria-label="Hero pond follows main look picker"
          />
          <Label htmlFor="hero-share-look" className="text-xs">
            Match main look
          </Label>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-52 w-full overflow-hidden sm:h-64 md:h-72">
          <KoiPond {...heroProps} />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 bg-gradient-to-b from-background/95 via-background/70 to-transparent px-6 pt-8 pb-16 text-center"
            aria-hidden
          >
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              A living koi pond for the web
            </h2>
            <p className="text-muted-foreground max-w-md text-sm">
              Glide, tap, feed — procedural koi in shared WebGL water from @hxlfed/koipond.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}