import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DEFAULT_PELE_THEME, type PeleTheme } from "@/lib/peleTheme"

type ThemePanelProps = {
  theme: PeleTheme
  onChange: (theme: PeleTheme) => void
  shrinkEnabled: boolean
  onShrinkEnabledChange: (enabled: boolean) => void
  panelWidthPercent: number
  onPanelWidthChange: (value: number) => void
}

const COLOR_FIELDS: { key: keyof PeleTheme; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "fg", label: "Foreground" },
  { key: "muted", label: "Muted" },
  { key: "accent", label: "Accent" },
  { key: "surface", label: "Surface" },
  { key: "border", label: "Border" },
]

export function ThemePanel({
  theme,
  onChange,
  shrinkEnabled,
  onShrinkEnabledChange,
  panelWidthPercent,
  onPanelWidthChange,
}: ThemePanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div>
        <h3 className="text-sm font-medium">Pele theme (--pele-*)</h3>
        <p className="text-xs text-muted-foreground">
          CSS variables update live via refresh() — no diagram re-render.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {COLOR_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <input
              type="color"
              aria-label={label}
              value={theme[key] as string}
              className="size-9 cursor-pointer rounded border bg-transparent p-0.5"
              onChange={(event) =>
                onChange({ ...theme, [key]: event.target.value })
              }
            />
            <Label className="text-xs">{label}</Label>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Corner radius ({theme.radius}px)</Label>
        <Slider
          min={0}
          max={16}
          step={1}
          value={[theme.radius]}
          onValueChange={(value) => {
            const next = Array.isArray(value) ? value[0] : value
            onChange({
              ...theme,
              radius: next ?? DEFAULT_PELE_THEME.radius,
            })
          }}
        />
      </div>
      <div className="flex flex-col gap-2 border-t pt-4">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="shrink-toggle" className="text-sm">
            Shrink Pele container
          </Label>
          <input
            id="shrink-toggle"
            type="checkbox"
            checked={shrinkEnabled}
            onChange={(event) => onShrinkEnabledChange(event.target.checked)}
            className="size-4"
          />
        </div>
        {shrinkEnabled ? (
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Width ({panelWidthPercent}%)</Label>
            <Slider
              min={25}
              max={100}
              step={1}
              value={[panelWidthPercent]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value
                onPanelWidthChange(next ?? 100)
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
