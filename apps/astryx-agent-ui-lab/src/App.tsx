import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpecInspector } from "@/components/SpecInspector.tsx"
import { AstryxPane } from "@/features/astryx/AstryxPane.tsx"
import { ShadcnPane } from "@/features/shadcn/ShadcnPane.tsx"
import type { FixtureId } from "@/lab/types.ts"
import { useLabState } from "@/lab/useLabState.ts"

export default function App() {
  const lab = useLabState()

  return (
    <div className="lab-shell min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Astryx Agent UI Lab
                </h1>
                <Badge variant="secondary">Compare</Badge>
              </div>
              <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
                Side-by-side preview of the same local settings/dashboard fixtures
                using real{" "}
                <a
                  href="https://github.com/meta/astryx"
                  className="text-foreground underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  Astryx
                </a>{" "}
                (0.7.8) and vendored shadcn/ui. Edits sync across both panes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="theme-mode"
                  checked={lab.colorMode === "dark"}
                  onCheckedChange={(on) =>
                    lab.setColorMode(on ? "dark" : "light")
                  }
                />
                <Label htmlFor="theme-mode">Dark mode</Label>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={lab.reset}>
                Reset sample state
              </Button>
            </div>
          </div>

          <Tabs
            value={lab.fixture}
            onValueChange={(v) => lab.setFixture(v as FixtureId)}
          >
            <TabsList aria-label="Prompt fixtures">
              <TabsTrigger value="settings">Settings prompt</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard prompt</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="sr-only">
              Settings fixture selected
            </TabsContent>
            <TabsContent value="dashboard" className="sr-only">
              Dashboard fixture selected
            </TabsContent>
          </Tabs>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <AstryxPane
            fixture={lab.fixture}
            colorMode={lab.colorMode}
            preferences={lab.preferences}
            onPreferencesChange={lab.patchPreferences}
          />
          <ShadcnPane
            fixture={lab.fixture}
            colorMode={lab.colorMode}
            preferences={lab.preferences}
            onPreferencesChange={lab.patchPreferences}
          />
        </div>
        <SpecInspector fixture={lab.fixture} preferences={lab.preferences} />
      </main>
    </div>
  )
}
