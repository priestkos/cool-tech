import { useState } from "react"

import type { UiKit } from "@/kits/plain-kit"

type GalleryScreenProps = {
  kit: UiKit
  kitLabel: string
}

export function GalleryScreen({ kit, kitLabel }: GalleryScreenProps) {
  const {
    Badge,
    Button,
    Card,
    Dialog,
    Input,
    Label,
    Slider,
    Switch,
    Tabs,
    Textarea,
  } = kit

  const [dialogOpen, setDialogOpen] = useState(false)
  const [sliderValue, setSliderValue] = useState([40])
  const [switchOn, setSwitchOn] = useState(true)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4">
      <div>
        <h2 className="text-lg font-semibold">Component gallery</h2>
        <p className="text-sm text-muted-foreground">
          {kitLabel} — same primitives used on Settings and Dashboard.
        </p>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Tabs</h3>
        <Tabs defaultValue="a">
          <Tabs.List>
            <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
            <Tabs.Trigger value="b">Beta</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="a" className="text-sm text-muted-foreground">
            Tab panels share identical props across kits.
          </Tabs.Content>
          <Tabs.Content value="b" className="text-sm text-muted-foreground">
            Looseleaf redraws the chrome; behavior stays the same.
          </Tabs.Content>
        </Tabs>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Switch & slider</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gallery-switch">Enable doodles</Label>
              <Switch id="gallery-switch" checked={switchOn} onCheckedChange={setSwitchOn} />
            </div>
            <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Badge & dialog</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-wrap items-center gap-2">
            <Badge>Sketch</Badge>
            <Badge variant="outline">Paper</Badge>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Trigger>
                <Button size="sm" variant="outline">
                  Open dialog
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Gallery dialog</Dialog.Title>
                  <Dialog.Description>Short copy for the component tour.</Dialog.Description>
                </Dialog.Header>
                <Dialog.Footer>
                  <Button onClick={() => setDialogOpen(false)}>Close</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog>
          </Card.Content>
        </Card>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Form controls</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="gallery-input">Input</Label>
            <Input id="gallery-input" placeholder="Notebook alias" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gallery-textarea">Textarea</Label>
            <Textarea id="gallery-textarea" rows={2} placeholder="Margin notes…" />
          </div>
        </div>
      </section>
    </div>
  )
}
