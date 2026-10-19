import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useAppSound } from "@/context/SoundProvider"
import { SoundPicker } from "@/components/SoundPicker"
import { toast } from "sonner"

export function SoundGallery() {
  const playButton = useAppSound("button")
  const playSwitch = useAppSound("switch")
  const playTabs = useAppSound("tabs")
  const playDialog = useAppSound("dialog")
  const playToast = useAppSound("toast")
  const [switchOn, setSwitchOn] = useState(false)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Button</CardTitle>
          <CardDescription>Tap to hear your mapped click sound.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <Button type="button" onClick={() => playButton()}>
            Primary action
          </Button>
          <SoundPicker componentKey="button" label="Button" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Switch</CardTitle>
          <CardDescription>Toggle plays a digital flip or your pick.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="demo-switch"
              checked={switchOn}
              onCheckedChange={(on) => {
                setSwitchOn(on)
                playSwitch()
              }}
            />
            <Label htmlFor="demo-switch">Enable sounds</Label>
          </div>
          <SoundPicker componentKey="switch" label="Switch" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
          <CardDescription>Switch tabs to trigger a highlight ding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            defaultValue="one"
            onValueChange={() => playTabs()}
          >
            <TabsList>
              <TabsTrigger value="one">Overview</TabsTrigger>
              <TabsTrigger value="two">Details</TabsTrigger>
              <TabsTrigger value="three">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="one" className="text-sm text-muted-foreground">
              Interface sounds give lightweight feedback without audio files.
            </TabsContent>
            <TabsContent value="two" className="text-sm text-muted-foreground">
              Each tab change can use a different installed recipe.
            </TabsContent>
            <TabsContent value="three" className="text-sm text-muted-foreground">
              Pick sounds from the Sound Lab library on reactbits.dev.
            </TabsContent>
          </Tabs>
          <SoundPicker componentKey="tabs" label="Tabs" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dialog</CardTitle>
          <CardDescription>Open the modal to play a reveal pop.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <Dialog
            onOpenChange={(open) => {
              if (open) playDialog()
            }}
          >
            <DialogTrigger render={<Button variant="outline" />}>
              Open dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sound-ready modal</DialogTitle>
                <DialogDescription>
                  Dialogs can share the same Sound Lab recipes as the rest of your UI.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <SoundPicker componentKey="dialog" label="Dialog" />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Toast (Sonner)</CardTitle>
          <CardDescription>Fire a toast and hear the mapped notification.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              playToast()
              toast("Saved to your device", {
                description: "Settings persist in localStorage.",
              })
            }}
          >
            Show toast
          </Button>
          <SoundPicker componentKey="toast" label="Toast" />
        </CardContent>
      </Card>
    </div>
  )
}
