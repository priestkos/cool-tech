import { Badge } from "@astryxdesign/core/Badge"
import { Card } from "@astryxdesign/core/Card"
import { Stack } from "@astryxdesign/core/Stack"
import { Text } from "@astryxdesign/core/Text"
import type { LabPreferences } from "@/lab/types.ts"

const METRICS = [
  { label: "Runs today", value: "12", hint: "Local fixture" },
  { label: "Success rate", value: "91%", hint: "Static sample" },
  { label: "Queue depth", value: "3", hint: "Not live data" },
] as const

type Props = {
  preferences: LabPreferences
}

export function AstryxDashboardFixture({ preferences }: Props) {
  const gap = preferences.density === "compact" ? 2 : 4

  return (
    <Stack gap={gap} width="100%">
      <Text type="display-2">Ops snapshot</Text>
      <Text type="supporting" color="secondary">
        Signed in as {preferences.displayName}
        {preferences.notifications ? " · alerts on" : " · alerts off"}
      </Text>
      <Stack direction="horizontal" gap={gap} width="100%" wrap="wrap">
        {METRICS.map((m) => (
          <Card key={m.label} variant="muted" padding={4} width={220}>
            <Badge label={m.hint} variant="neutral" />
            <Text type="display-1">{m.value}</Text>
            <Text type="supporting" color="secondary">
              {m.label}
            </Text>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}
