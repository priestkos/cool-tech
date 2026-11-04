import type { UiKit } from "@/kits/plain-kit"

type DashboardScreenProps = {
  kit: UiKit
}

const stats = [
  { label: "Sketches shipped", value: "128", badge: "This week" },
  { label: "Ink saved", value: "4.2k", badge: "Fictional" },
  { label: "Notebook pages", value: "36", badge: "Draft" },
]

export function DashboardScreen({ kit }: DashboardScreenProps) {
  const { Badge, Button, Card, Tabs } = kit

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Made-up metrics for the side-by-side demo.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <Card.Header className="pb-2">
              <Card.Description>{stat.label}</Card.Description>
              <Card.Title className="text-2xl">{stat.value}</Card.Title>
            </Card.Header>
            <Card.Content>
              <Badge variant="secondary">{stat.badge}</Badge>
            </Card.Content>
          </Card>
        ))}
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Studio activity</Card.Title>
          <Card.Description>Tabbed card with placeholder actions.</Card.Description>
        </Card.Header>
        <Card.Content>
          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="exports">Exports</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="overview" className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Three fictional collaborators edited sketch boards overnight.</p>
              <Button size="sm">Open activity log</Button>
            </Tabs.Content>
            <Tabs.Content value="exports" className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>No real exports — this button is inert beyond the toast demo.</p>
              <Button size="sm" variant="outline">
                Queue PDF export
              </Button>
            </Tabs.Content>
          </Tabs>
        </Card.Content>
      </Card>
    </div>
  )
}
