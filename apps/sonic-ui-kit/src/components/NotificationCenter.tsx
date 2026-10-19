import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppSound } from "@/context/SoundProvider"
import { SoundPicker } from "@/components/SoundPicker"
import { toast } from "sonner"

export function NotificationCenter() {
  const playSuccess = useAppSound("toastSuccess")
  const playError = useAppSound("toastError")
  const playInfo = useAppSound("toastInfo")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification center</CardTitle>
        <CardDescription>
          Success, error, and info toasts each carry their own Sound Lab recipe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              playSuccess()
              toast.success("Profile updated", {
                description: "Your preferences were saved locally.",
              })
            }}
          >
            Success toast
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              playError()
              toast.error("Could not sync", {
                description: "This demo is offline-only — no server to reach.",
              })
            }}
          >
            Error toast
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              playInfo()
              toast.info("Tip", {
                description: "Sounds are TypeScript recipes, not MP3 files.",
              })
            }}
          >
            Info toast
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <SoundPicker componentKey="toastSuccess" label="Success" />
          <SoundPicker componentKey="toastError" label="Error" />
          <SoundPicker componentKey="toastInfo" label="Info" />
        </div>
      </CardContent>
    </Card>
  )
}
