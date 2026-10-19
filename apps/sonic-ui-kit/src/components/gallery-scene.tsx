import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SoundSelect } from '@/components/sound-select'
import { useSoundKit } from '@/context/sound-provider'
import type { ComponentKey } from '@/lib/sound-catalog'
import { toast } from 'sonner'

const galleryItems: { key: ComponentKey; title: string; hint: string }[] = [
  { key: 'button', title: 'Button', hint: 'Click plays your tap sound' },
  { key: 'switch', title: 'Switch', hint: 'Toggle plays your switch sound' },
  { key: 'tabs', title: 'Tabs', hint: 'Changing tabs plays your tab sound' },
  { key: 'dialog', title: 'Dialog', hint: 'Opening plays your modal sound' },
  { key: 'toast', title: 'Toast', hint: 'Sample toast uses your toast sound' },
]

export function GalleryScene() {
  const { settings, setComponentSound, playForComponent } = useSoundKit()
  const [switchOn, setSwitchOn] = useState(true)
  const [tab, setTab] = useState('one')

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {galleryItems.map(item => (
        <article
          key={item.key}
          className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-left"
        >
          <div>
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.hint}</p>
          </div>
          <SoundSelect
            label="Sound"
            value={settings.componentSounds[item.key]}
            onValueChange={id => setComponentSound(item.key, id)}
          />
          <div className="flex flex-wrap items-center gap-3">
            {item.key === 'button' ? (
              <Button type="button" onClick={() => playForComponent('button')}>
                Press me
              </Button>
            ) : null}
            {item.key === 'switch' ? (
              <div className="flex items-center gap-2">
                <Switch
                  id="gallery-switch"
                  checked={switchOn}
                  onCheckedChange={checked => {
                    setSwitchOn(checked)
                    playForComponent('switch')
                  }}
                />
                <Label htmlFor="gallery-switch">Notifications</Label>
              </div>
            ) : null}
            {item.key === 'tabs' ? (
              <Tabs
                value={tab}
                onValueChange={value => {
                  setTab(value)
                  playForComponent('tabs')
                }}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="one">Overview</TabsTrigger>
                  <TabsTrigger value="two">Details</TabsTrigger>
                  <TabsTrigger value="three">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="one" className="text-sm text-muted-foreground">
                  Tab content updates silently — listen for the glide.
                </TabsContent>
                <TabsContent value="two" className="text-sm text-muted-foreground">
                  Swap sounds in the picker to compare React Bits recipes.
                </TabsContent>
                <TabsContent value="three" className="text-sm text-muted-foreground">
                  Every sound is TypeScript you own, not a bundled MP3.
                </TabsContent>
              </Tabs>
            ) : null}
            {item.key === 'dialog' ? (
              <Dialog
                onOpenChange={open => {
                  if (open) playForComponent('dialog')
                }}
              >
                <DialogTrigger render={<Button variant="outline" type="button" />}>
                  Open dialog
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sound on open</DialogTitle>
                    <DialogDescription>
                      Dialogs can share the same Sound Lab breeze as sheets and modals.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            ) : null}
            {item.key === 'toast' ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  playForComponent('toast')
                  toast('Heads up', {
                    description: 'This toast uses your selected notification sound.',
                  })
                }}
              >
                Fire toast
              </Button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
