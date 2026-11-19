import { Badge } from "@/components/ui/badge"
import { AboutPanel } from "@/features/about/AboutPanel"
import { AxisPlayground } from "@/features/axis/AxisPlayground"
import { ContextualBox } from "@/features/contextual/ContextualBox"
import { FeatureToggles } from "@/features/features/FeatureToggles"
import { UiPreview } from "@/features/preview/UiPreview"
import { useAlloLab } from "@/hooks/useAlloLab"

export default function App() {
  const lab = useAlloLab()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Allo Type Lab</h1>
              <Badge variant="outline">allo-font 1.0.0</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Offline playground for the real{" "}
              <a
                href="https://allo.joshpuckett.me"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                Allo
              </a>{" "}
              variable typeface — axes, OpenType features, contextual arrows, and UI presets.
            </p>
          </div>
          <a href="#about" className="text-muted-foreground text-xs underline underline-offset-2">
            Credits &amp; license
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <AxisPlayground
          axes={lab.axes}
          onWght={lab.setWght}
          onRond={lab.setRond}
          onOpsz={lab.setOpsz}
          onAutoOpsz={lab.setAutoOpsz}
          onPad={lab.setFromPad}
        />
        <FeatureToggles axes={lab.axes} features={lab.features} onToggle={lab.toggleFeature} />
        <ContextualBox axes={lab.axes} />
        <UiPreview
          axes={lab.axes}
          features={lab.features}
          activePreset={lab.activePreset}
          onPreset={lab.applyPersonalityPreset}
        />
        <AboutPanel />
      </main>
    </div>
  )
}