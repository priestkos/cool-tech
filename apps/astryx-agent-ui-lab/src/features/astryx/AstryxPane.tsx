import { Theme } from "@astryxdesign/core/theme"
import { neutralTheme } from "@astryxdesign/theme-neutral/built"
import type { ColorMode, FixtureId, LabPreferences } from "@/lab/types.ts"
import { AstryxDashboardFixture } from "./AstryxDashboardFixture.tsx"
import { AstryxSettingsFixture } from "./AstryxSettingsFixture.tsx"

type Props = {
  fixture: FixtureId
  colorMode: ColorMode
  preferences: LabPreferences
  onPreferencesChange: (patch: Partial<LabPreferences>) => void
}

export function AstryxPane({
  fixture,
  colorMode,
  preferences,
  onPreferencesChange,
}: Props) {
  return (
    <section
      className="astryx-pane rounded-xl border border-border/60 bg-muted/30 p-3"
      aria-label="Astryx preview"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
        <div>
          <p className="text-xs font-medium text-foreground">Astryx</p>
          <p className="text-muted-foreground text-[11px]">
            @astryxdesign/core@0.7.8 · theme-neutral@0.7.8
          </p>
        </div>
        <span className="rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border">
          Real integration
        </span>
      </header>
      <div className="astryx-surface">
        <Theme theme={neutralTheme} mode={colorMode}>
          {fixture === "settings" ? (
            <AstryxSettingsFixture
              preferences={preferences}
              onChange={onPreferencesChange}
            />
          ) : (
            <AstryxDashboardFixture preferences={preferences} />
          )}
        </Theme>
      </div>
    </section>
  )
}
