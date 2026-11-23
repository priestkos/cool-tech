import { useMemo, useState } from "react"

import {
  GlassActionButton,
  GlassButton,
  GlassCard,
  GlassLayer,
  type GlassOptics,
} from "@/components/liquid-glass"
import { RangeSlider } from "@/components/liquid-glass/controls/RangeSlider"
import { Switch } from "@/components/liquid-glass/controls/Switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import {
  DEFAULT_TUNING,
  labToCardBlur,
  labToCardOptics,
  labToKnobBounce,
  labToLayerBlur,
  labToLayerOptics,
  labToPressSpring,
  labToSliderRefraction,
  labToSwitchRefraction,
  type LabTuning,
} from "./tuning"

export type BackdropMode = "photo" | "gradient"

type ControlBoardProps = {
  backdrop: BackdropMode
  onBackdropChange: (mode: BackdropMode) => void
  tuning: LabTuning
  onTuningChange: (next: LabTuning) => void
}

function NumericReadout({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground">
      {value.toFixed(suffix ? 2 : 0)}
      {suffix}
    </span>
  )
}

export function ControlBoard({ backdrop, onBackdropChange, tuning, onTuningChange }: ControlBoardProps) {
  const [volume, setVolume] = useState(62)
  const [notify, setNotify] = useState(true)
  const [aboutOpen, setAboutOpen] = useState(false)

  const cardBlur = labToCardBlur(tuning.blur)
  const cardOptics: GlassOptics = useMemo(() => labToCardOptics(tuning.refraction), [tuning.refraction])
  const layerOptics = useMemo(
    () => labToLayerOptics(tuning.refraction, tuning.blur),
    [tuning.refraction, tuning.blur],
  )
  const layerBlur = labToLayerBlur(tuning.blur)
  const sliderRefraction = labToSliderRefraction(tuning.refraction)
  const switchRefraction = labToSwitchRefraction(tuning.refraction)
  const { pressSpeed, pressBounce } = labToPressSpring(tuning.spring)
  const knobBounce = labToKnobBounce(tuning.spring)

  const patchTuning = (partial: Partial<LabTuning>) => onTuningChange({ ...tuning, ...partial })

  return (
  <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-4 sm:p-6">
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-2 shadow-lg backdrop-blur-md">
          <Label className="sr-only">Backdrop</Label>
          <Button
            type="button"
            size="sm"
            variant={backdrop === "photo" ? "default" : "outline"}
            className="bg-white/90 text-foreground"
            onClick={() => onBackdropChange("photo")}
          >
            Photo
          </Button>
          <Button
            type="button"
            size="sm"
            variant={backdrop === "gradient" ? "default" : "outline"}
            className="bg-white/90 text-foreground"
            onClick={() => onBackdropChange("gradient")}
          >
            Gradient
          </Button>
          <Badge variant="secondary" className="ml-1 bg-white/80">
            Live glass
          </Badge>
        </div>
      </header>

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-24 sm:px-8">
        <GlassCard
          live
          blur={cardBlur}
          optics={cardOptics}
          className="w-full max-w-3xl p-6 shadow-2xl sm:p-8"
        >
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                Liquid Glass Controls
              </h1>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/80">
                Vendored kit at pin <code className="text-xs">d11b3f6</code> — press, flip, and slide real glass
                lenses over a swappable backdrop.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <GlassButton size="lg">Primary</GlassButton>
              <button
                type="button"
                data-glass-host=""
                className={cn(
                  "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 bg-white/60 px-5 text-sm font-semibold text-neutral-900 shadow-sm backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-[#3291FF] focus-visible:ring-offset-2",
                )}
              >
                <GlassLayer material="clear" blur={layerBlur} optics={layerOptics} />
                Tunable host
              </button>
              <GlassActionButton
                size="md"
                pendingLabel="Working"
                successLabel="Done"
                resetAfter={1400}
                onAction={() => new Promise((r) => setTimeout(r, 900))}
              >
                Action
              </GlassActionButton>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="lab-switch">Switch</Label>
                <Switch
                  checked={notify}
                  onChange={setNotify}
                  label="Notifications"
                  refraction={switchRefraction}
                  knobBounce={knobBounce}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lab-volume">Range slider</Label>
                <RangeSlider
                  value={volume}
                  onChange={setVolume}
                  label="Volume"
                  min={0}
                  max={100}
                  refraction={sliderRefraction}
                  pressSpeed={pressSpeed}
                  pressBounce={pressBounce}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <Card className="w-full max-w-3xl border-white/25 bg-background/85 shadow-xl backdrop-blur-md">
          <CardHeader>
            <CardTitle>Optics &amp; spring tuners</CardTitle>
            <CardDescription>
              Real <code className="text-xs">GlassOptics</code>, <code className="text-xs">blur</code>, and{" "}
              <code className="text-xs">pressSpeed</code> / <code className="text-xs">pressBounce</code> APIs —
              not CSS stand-ins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Refraction</Label>
                <NumericReadout value={cardOptics.refraction ?? 1} />
              </div>
              <RangeSlider
                value={tuning.refraction}
                onChange={(v) => patchTuning({ refraction: v })}
                label=""
                min={0}
                max={100}
                showValue={false}
                size="sm"
                refraction={sliderRefraction}
                pressSpeed={pressSpeed}
                pressBounce={pressBounce}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Blur (card px + clear mip)</Label>
                <NumericReadout value={cardBlur} suffix=" px" />
              </div>
              <RangeSlider
                value={tuning.blur}
                onChange={(v) => patchTuning({ blur: v })}
                label=""
                min={0}
                max={100}
                showValue={false}
                size="sm"
                refraction={sliderRefraction}
                pressSpeed={pressSpeed}
                pressBounce={pressBounce}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Spring stiffness</Label>
                <NumericReadout value={pressSpeed} suffix=" ω" />
              </div>
              <RangeSlider
                value={tuning.spring}
                onChange={(v) => patchTuning({ spring: v })}
                label=""
                min={0}
                max={100}
                showValue={false}
                size="sm"
                pressSpeed={pressSpeed}
                pressBounce={pressBounce}
                refraction={sliderRefraction}
              />
            </div>
            <Button type="button" variant="outline" onClick={() => onTuningChange(DEFAULT_TUNING)}>
              Reset tuners
            </Button>
          </CardContent>
        </Card>

        <Button type="button" variant="secondary" className="bg-background/80" onClick={() => setAboutOpen((o) => !o)}>
          {aboutOpen ? "Hide credits" : "About & MIT credits"}
        </Button>

        {aboutOpen && (
          <Card className="w-full max-w-3xl border-border/80 bg-background/95">
            <CardHeader>
              <CardTitle>Third-party credits</CardTitle>
              <CardDescription>Independent demo — not affiliated with the upstream author.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Liquid Glass UI © 2026 Bilal Abdullah Gürşen —{" "}
                <a className="text-primary underline" href="https://github.com/bilalgursen/liquid-glass">
                  github.com/bilalgursen/liquid-glass
                </a>{" "}
                (MIT). Vendored commit{" "}
                <code className="text-xs">d11b3f62407f8d5ec1573c8591e2047248c52cbf</code>, committer 2026-11-19. See{" "}
                <code className="text-xs">THIRD_PARTY_LICENSES.liquid-glass</code> in this app folder.
              </p>
              <p>
                Upstream demo:{" "}
                <a className="text-primary underline" href="https://liquid-glass-interface.pages.dev">
                  liquid-glass-interface.pages.dev
                </a>
                . Launch post:{" "}
                <a className="text-primary underline" href="https://x.com/bilalgursen777/status/2124533364283552065">
                  X / bilalgursen777
                </a>
                .
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}