import { GlobalSoundControls } from "@/components/GlobalSoundControls"
import { NotificationCenter } from "@/components/NotificationCenter"
import { SoundGallery } from "@/components/SoundGallery"
import { SoundsAsCode } from "@/components/SoundsAsCode"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import { SoundProvider } from "@/context/SoundProvider"

function App() {
  return (
    <SoundProvider>
      <div className="min-h-svh bg-background text-foreground">
        <header className="border-b">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              React Bits · Sound Lab
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Sonic UI Kit
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              A shadcn playground wired to Sound Lab interface sounds — installable
              recipes you own, tuned with global volume and per-component pickers.
            </p>
          </div>
        </header>
        <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
          <GlobalSoundControls />
          <Tabs defaultValue="gallery">
            <TabsList>
              <TabsTrigger value="gallery">Component gallery</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="code">Sounds as code</TabsTrigger>
            </TabsList>
            <TabsContent value="gallery" className="mt-6">
              <SoundGallery />
            </TabsContent>
            <TabsContent value="notifications" className="mt-6">
              <NotificationCenter />
            </TabsContent>
            <TabsContent value="code" className="mt-6">
              <SoundsAsCode />
            </TabsContent>
          </Tabs>
        </main>
        <Toaster position="top-right" richColors closeButton />
      </div>
    </SoundProvider>
  )
}

export default App
