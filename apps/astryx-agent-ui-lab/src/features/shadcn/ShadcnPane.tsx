import { cn } from "@/lib/utils"
import type { ColorMode, FixtureId, LabPreferences } from "@/lab/types.ts"
import { ShadcnDashboardFixture } from "./ShadcnDashboardFixture.tsx"
import { ShadcnSettingsFixture } from "./ShadcnSettingsFixture.tsx"

type Props = {
  fixture: FixtureId
  colorMode: ColorMode
  preferences: LabPreferences
  onPreferencesChange: (patch: Partial<LabPreferences>) => void
}

export function ShadcnPane({
  fixture,
  colorMode,
  preferences,
  onPreferencesChange,
}: Props) {
  return (
    <section
      className={cn(
        "shadcn-pane rounded-xl border border-border/60 bg-muted/30 p-3",
        colorMode === "dark" && "dark",
      )}
      aria-label="shadcn preview"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
        <div>
          <p className="text-xs font-medium text-foreground">shadcn/ui</p>
          <p className="text-muted-foreground text-[11px]">
            CLI 4.22.1 · base-mira vendored components
          </p>
        </div>
        <span className="rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border">
          Real integration
        </span>
      </header>
      {fixture === "settings" ? (
        <ShadcnSettingsFixture
          preferences={preferences}
          onChange={onPreferencesChange}
        />
      ) : (
        <ShadcnDashboardFixture preferences={preferences} />
      )}
    </section>
  )
}
