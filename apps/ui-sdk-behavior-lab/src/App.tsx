import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AnnouncementLog } from "@/lab/AnnouncementLog"
import { AriaInspector } from "@/lab/AriaInspector"
import { BehaviorDemoPanel } from "@/lab/BehaviorDemoPanel"
import { KeyboardWalkthrough } from "@/lab/KeyboardWalkthrough"
import { RecipePanel } from "@/lab/RecipePanel"
import type { LabBehaviorId } from "@/lib/fixtures"
import { SdkCombobox } from "@/widgets/SdkCombobox"
import { ShadcnCombobox } from "@/widgets/ShadcnCombobox"
import { SortableTaskList } from "@/widgets/SortableTaskList"

export default function App() {
  const [activeBehavior, setActiveBehavior] = useState<LabBehaviorId>("popup")
  const [inspectTarget, setInspectTarget] = useState<HTMLElement | null>(null)
  const [announcements, setAnnouncements] = useState<string[]>([])

  const onAnnounce = useCallback((text: string) => {
    setAnnouncements((prev) => [text, ...prev].slice(0, 12))
  }, [])

  const onInspectTarget = useCallback((el: HTMLElement | null) => {
    setInspectTarget(el)
  }, [])

  useEffect(() => {
    const onFocusIn = () => {
      const active = document.activeElement
      if (active instanceof HTMLElement && active.dataset.inspect === "true") {
        setInspectTarget(active)
      }
    }
    document.addEventListener("focusin", onFocusIn)
    return () => document.removeEventListener("focusin", onFocusIn)
  }, [])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-card/80 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-lg font-semibold tracking-tight">
              UI SDK Behavior Lab
            </h1>
            <p className="max-w-2xl text-xs text-muted-foreground">
              Runs the real{" "}
              <a
                href="https://ui-sdk.dev"
                className="underline"
                rel="noreferrer"
              >
                UI SDK
              </a>{" "}
              packages at{" "}
              <code className="text-[0.65rem]">@ui-sdk/*@0.1.0-beta.2</code>{" "}
              (Apache-2.0).
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            Offline · no runtime network
          </Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[1fr_280px] md:px-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Behavior picker</CardTitle>
              <CardDescription>
                Pick a primitive demo; ARIA on the active control updates in the
                inspector.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BehaviorDemoPanel
                active={activeBehavior}
                onActiveChange={setActiveBehavior}
                onInspectTarget={onInspectTarget}
                onAnnounce={onAnnounce}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Combobox comparison</CardTitle>
              <CardDescription>
                Official @ui-sdk/react combobox vs Base UI reference column.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <SdkCombobox
                label="UI SDK combobox"
                onInspectTarget={onInspectTarget}
              />
              <ShadcnCombobox onInspectTarget={onInspectTarget} />
            </CardContent>
          </Card>

          <KeyboardWalkthrough />

          <div className="grid gap-6 md:grid-cols-2">
            <SortableTaskList
              onAnnounce={onAnnounce}
              onInspectTarget={onInspectTarget}
            />
            <AnnouncementLog entries={announcements} />
          </div>

          <RecipePanel />
        </div>

        <aside className="md:sticky md:top-4 md:self-start">
          <AriaInspector target={inspectTarget} />
        </aside>
      </main>
    </div>
  )
}