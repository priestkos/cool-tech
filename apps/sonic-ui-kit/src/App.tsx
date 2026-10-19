import { GlobalSoundControls } from '@/components/global-sound-controls'
import { GalleryScene } from '@/components/gallery-scene'
import { NotificationScene } from '@/components/notification-scene'
import { SoundsAsCodeScene } from '@/components/sounds-as-code-scene'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/sonner'
import { SoundProvider } from '@/context/sound-provider'

function App() {
  return (
    <SoundProvider>
      <div className="min-h-svh bg-background text-foreground">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
          <header className="space-y-2 text-left">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Sonic UI Kit
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              React Bits Sound Lab playground
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Wire installable Sound Lab interface sounds into shadcn components — per-control
              pickers, global mute/volume, and a notification center.
            </p>
          </header>

          <GlobalSoundControls />

          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="code">Sounds as code</TabsTrigger>
            </TabsList>
            <TabsContent value="gallery" className="pt-4">
              <GalleryScene />
            </TabsContent>
            <TabsContent value="notifications" className="pt-4">
              <NotificationScene />
            </TabsContent>
            <TabsContent value="code" className="pt-4">
              <SoundsAsCodeScene />
            </TabsContent>
          </Tabs>
        </div>
        <Toaster richColors position="top-center" />
      </div>
    </SoundProvider>
  )
}

export default App
