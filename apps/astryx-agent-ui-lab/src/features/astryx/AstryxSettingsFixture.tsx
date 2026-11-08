import { Card } from "@astryxdesign/core/Card"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl"
import { Switch } from "@astryxdesign/core/Switch"
import { Text } from "@astryxdesign/core/Text"
import { TextInput } from "@astryxdesign/core/TextInput"
import type { Density, LabPreferences } from "@/lab/types.ts"

type Props = {
  preferences: LabPreferences
  onChange: (patch: Partial<LabPreferences>) => void
}

export function AstryxSettingsFixture({ preferences, onChange }: Props) {
  return (
    <Card padding={4} width="100%">
      <Text type="display-2">Agent preferences</Text>
      <Text type="supporting" color="secondary">
        Illustrative settings fixture — sample state only.
      </Text>
      <Switch
        label="Push notifications"
        value={preferences.notifications}
        onChange={(next) => onChange({ notifications: next })}
      />
      <TextInput
        label="Display name"
        value={preferences.displayName}
        onChange={(value) => onChange({ displayName: value })}
      />
      <SegmentedControl
        label="Density"
        value={preferences.density}
        onChange={(value) => onChange({ density: value as Density })}
        layout="fill"
      >
        <SegmentedControlItem value="compact" label="Compact" />
        <SegmentedControlItem value="comfortable" label="Comfortable" />
      </SegmentedControl>
    </Card>
  )
}
