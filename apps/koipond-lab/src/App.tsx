import { KoiPond, type KoiPondHandle } from "@hxlfed/koipond"
import { useMemo, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AboutCredits } from "@/features/koipond/AboutCredits"
import { HeroPreview } from "@/features/koipond/HeroPreview"
import { InteractionBar } from "@/features/koipond/InteractionBar"
import { PropsPanel } from "@/features/koipond/PropsPanel"
import { detectWebGl2 } from "@/features/koipond/webgl"
import { usePondLab } from "@/features/koipond/usePondLab"

export default function App() {
  const pondRef = useRef<KoiPondHandle>(null)
  const lab = usePondLab()
  const webGl2 = useMemo(() => detectWebGl2(), [])

  return (
    <div className="min-h-dvh">
      <section
        aria-label="Full-screen koi pond"
        className="fixed inset-0 z-0 min-h-dvh w-full"
      >
        <KoiPond
          ref={pondRef}
          {...lab.pondProps}
          className="h-full w-full"
          style={{ height: "100vh" }}
        />
      </section>

      <a
        href="#lab-main"
        className="focus:bg-primary sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to controls
      </a>

      <div className="pointer-events-none relative z-10 flex min-h-dvh flex-col">
        <header className="pointer-events-auto border-b border-border/40 bg-background/75 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <div className="space-y-1">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                  Koipond Lab
                </span>
                <Badge variant="outline">@hxlfed/koipond 0.1.0</Badge>
                <Badge variant="secondary">three 0.187.0</Badge>
              </p>
              <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm">
                Real MIT npm component — not a CSS lookalike. Offline at runtime.
              </p>
            </div>
            <AboutCredits />
          </div>
        </header>

        <main
          id="lab-main"
          className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]"
        >
          <div className="hidden lg:block" aria-hidden />

          <div className="pointer-events-auto space-y-6 lg:col-start-2">
            {!webGl2 ? (
              <Card className="border-amber-500/40 bg-amber-50/90 dark:bg-amber-950/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">WebGL2 unavailable</CardTitle>
                  <CardDescription className="text-xs">
                    This browser cannot create a WebGL2 context. The official component falls back
                    to its simpler stylised water — not a lab reimplementation.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : null}

            <Card className="border-border/70 bg-card/92 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Lab controls</CardTitle>
                <CardDescription className="text-xs">
                  Props match <code className="text-[0.7rem]">KoiPond</code> defaults from 0.1.0.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="props">
                  <TabsList className="mb-4 w-full">
                    <TabsTrigger value="props" className="flex-1">
                      Props
                    </TabsTrigger>
                    <TabsTrigger value="feed" className="flex-1">
                      Feed
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="props">
                    <ScrollArea className="max-h-[min(52vh,28rem)] pr-3">
                      <PropsPanel lab={lab} />
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="feed">
                    <InteractionBar pondRef={pondRef} lab={lab} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <HeroPreview
              look={lab.heroLook}
              shareLook={lab.heroSharesLook}
              onShareLookChange={lab.setHeroSharesLook}
              baseProps={lab.pondProps}
            />
          </div>
        </main>
      </div>
    </div>
  )
}