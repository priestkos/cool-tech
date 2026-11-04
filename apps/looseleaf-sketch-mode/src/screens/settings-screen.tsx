import { useState } from "react"
import { useForm } from "react-hook-form"

import type { UiKit } from "@/kits/plain-kit"
import {
  settingsFieldRules,
  settingsFormDefaults,
  type SettingsFormValues,
} from "@/lib/settings-form"

type SettingsScreenProps = {
  kit: UiKit
}

export function SettingsScreen({ kit }: SettingsScreenProps) {
  const {
    Button,
    Card,
    Dialog,
    Form: FormRoot,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Slider,
    Switch,
    Tabs,
    Textarea,
    toast,
  } = kit

  const form = useForm<SettingsFormValues>({
    defaultValues: settingsFormDefaults,
    mode: "onSubmit",
  })

  const [deleteOpen, setDeleteOpen] = useState(false)

  const onSave = form.handleSubmit((values) => {
    toast(`Saved settings for ${values.displayName || "guest"}.`)
  })

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 p-4">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Fictional account preferences for demo purposes only.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <Tabs.List className="grid w-full grid-cols-2">
          <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
          <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="profile" className="mt-4 space-y-4">
          <FormRoot {...form}>
            <form className="space-y-4" onSubmit={onSave}>
              <FormField
                control={form.control}
                name="displayName"
                rules={settingsFieldRules.displayName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alex Notebook" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                rules={settingsFieldRules.bio}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short fictional bio…" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save profile</Button>
            </form>
          </FormRoot>
        </Tabs.Content>

        <Tabs.Content value="notifications" className="mt-4 space-y-4">
          <FormRoot {...form}>
            <form className="space-y-6" onSubmit={onSave}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Email alerts</p>
                  <p className="text-xs text-muted-foreground">Fake weekly digest</p>
                </div>
                <FormField
                  control={form.control}
                  name="emailAlerts"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Product tips</p>
                  <p className="text-xs text-muted-foreground">Optional sketch hints</p>
                </div>
                <FormField
                  control={form.control}
                  name="productTips"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="volume"
                rules={settingsFieldRules.volume}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification volume — {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(v) => field.onChange(v[0] ?? 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save notifications</Button>
            </form>
          </FormRoot>
        </Tabs.Content>
      </Tabs>

      <Card>
        <Card.Header>
          <Card.Title>Danger zone</Card.Title>
          <Card.Description>Removes the fictional demo account.</Card.Description>
        </Card.Header>
        <Card.Footer>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <Dialog.Trigger asChild>
              <Button variant="destructive">Delete account</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete fictional account?</Dialog.Title>
                <Dialog.Description>
                  This only resets the form in the demo. No real data is stored.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.Close>
                <Button
                  variant="destructive"
                  onClick={() => {
                    form.reset(settingsFormDefaults)
                    setDeleteOpen(false)
                    toast("Fictional account removed from this session.")
                  }}
                >
                  Confirm delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </Card.Footer>
      </Card>
    </div>
  )
}
