import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { Density, LabPreferences } from "@/lab/types.ts"

type Props = {
  preferences: LabPreferences
  onChange: (patch: Partial<LabPreferences>) => void
}

export function ShadcnSettingsFixture({ preferences, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent preferences</CardTitle>
        <CardDescription>
          Illustrative settings fixture — sample state only.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="shadcn-notifications">Push notifications</Label>
          <Switch
            id="shadcn-notifications"
            checked={preferences.notifications}
            onCheckedChange={(checked) =>
              onChange({ notifications: Boolean(checked) })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="shadcn-display-name">Display name</Label>
          <Input
            id="shadcn-display-name"
            value={preferences.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium">Density</span>
          <div className="flex gap-2">
            {(["compact", "comfortable"] as Density[]).map((d) => (
              <Button
                key={d}
                type="button"
                size="sm"
                variant={preferences.density === d ? "default" : "outline"}
                className={cn("capitalize")}
                onClick={() => onChange({ density: d })}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
