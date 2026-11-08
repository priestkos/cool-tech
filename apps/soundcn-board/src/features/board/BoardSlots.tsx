import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PRESET_IDS,
  type BoardSlot,
  type PresetId,
} from "@/lib/soundcn/presets"
import { usePresetPlayer } from "./usePresetPlayer"
import { formatPresetLabel } from "./board-model"

type SlotProps = {
  soundEnabled: boolean
  volume: number
  presetId: PresetId
  onPresetChange: (presetId: PresetId) => void
  onPlayed: (presetId: PresetId, slotLabel: string) => void
}

function PresetSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: PresetId
  onChange: (presetId: PresetId) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as PresetId)}
      >
        {PRESET_IDS.map((pid) => (
          <option key={pid} value={pid}>
            {formatPresetLabel(pid)}
          </option>
        ))}
      </select>
    </div>
  )
}

function PrimaryButtonSlot({
  soundEnabled,
  volume,
  presetId,
  onPresetChange,
  onPlayed,
}: SlotProps) {
  const { play } = usePresetPlayer(presetId, soundEnabled, volume, () =>
    onPlayed(presetId, "Primary button"),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Primary button</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PresetSelect
          id="preset-primary"
          label="Assigned preset"
          value={presetId}
          onChange={onPresetChange}
        />
        <Button type="button" className="w-full" onClick={() => play()}>
          Try soft click
        </Button>
      </CardContent>
    </Card>
  )
}

function ToggleSlot({
  soundEnabled,
  volume,
  presetId,
  toggleOn,
  switchOffPreset,
  onPresetChange,
  onToggle,
  onPlayed,
}: SlotProps & {
  toggleOn: boolean
  switchOffPreset: PresetId
  onToggle: (next: boolean) => void
}) {
  const onPlayer = usePresetPlayer(presetId, soundEnabled, volume, () =>
    onPlayed(presetId, "Toggle on"),
  )
  const offPlayer = usePresetPlayer(switchOffPreset, soundEnabled, volume, () =>
    onPlayed(switchOffPreset, "Toggle off"),
  )

  const handleToggle = (next: boolean) => {
    onToggle(next)
    if (next) {
      onPlayer.play()
    } else {
      offPlayer.play()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Toggle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PresetSelect
          id="preset-toggle"
          label="On-state preset"
          value={presetId}
          onChange={onPresetChange}
        />
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
          <Label htmlFor="demo-toggle">Notifications</Label>
          <Switch
            id="demo-toggle"
            checked={toggleOn}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationSlot({
  soundEnabled,
  volume,
  presetId,
  onPresetChange,
  onPlayed,
}: SlotProps) {
  const { play } = usePresetPlayer(presetId, soundEnabled, volume, () =>
    onPlayed(presetId, "Notification"),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PresetSelect
          id="preset-notification"
          label="Assigned preset"
          value={presetId}
          onChange={onPresetChange}
        />
        <Button type="button" variant="secondary" className="w-full" onClick={() => play()}>
          Fire notification
        </Button>
      </CardContent>
    </Card>
  )
}

type BoardSlotsProps = {
  soundEnabled: boolean
  volume: number
  slotPresets: Record<BoardSlot, PresetId>
  toggleOn: boolean
  switchOffPreset: PresetId
  onSlotPreset: (slot: BoardSlot, presetId: PresetId) => void
  onToggle: (next: boolean) => void
  onPlayed: (presetId: PresetId, slotLabel: string) => void
}

export function BoardSlots(props: BoardSlotsProps) {
  return (
    <div className="grid gap-4">
      <PrimaryButtonSlot
        soundEnabled={props.soundEnabled}
        volume={props.volume}
        presetId={props.slotPresets["primary-button"]}
        onPresetChange={(id) => props.onSlotPreset("primary-button", id)}
        onPlayed={props.onPlayed}
      />
      <ToggleSlot
        soundEnabled={props.soundEnabled}
        volume={props.volume}
        presetId={props.slotPresets.toggle}
        toggleOn={props.toggleOn}
        switchOffPreset={props.switchOffPreset}
        onPresetChange={(id) => props.onSlotPreset("toggle", id)}
        onToggle={props.onToggle}
        onPlayed={props.onPlayed}
      />
      <NotificationSlot
        soundEnabled={props.soundEnabled}
        volume={props.volume}
        presetId={props.slotPresets.notification}
        onPresetChange={(id) => props.onSlotPreset("notification", id)}
        onPlayed={props.onPlayed}
      />
    </div>
  )
}
