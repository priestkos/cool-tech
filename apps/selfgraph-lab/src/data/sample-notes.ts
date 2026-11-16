export const SAMPLE_NOTES = `# Meridian field notes — 2026-03-15

Ann Chen joined Northwind Labs as a backend engineer. Ann Chen reports to Marco Silva at the Seattle office.

Ann Chen previously interned at Harbor Analytics during 2024.

# Update — 2026-06-02

Ann Chen left Northwind Labs and started at Cascade Research as a staff engineer.

# Open questions

Who leads the graph storage evaluation?`

export const SAMPLE_SECTIONS = [
  {
    id: "notes-2026-03-15",
    title: "March 2026 notes",
    text: `# Meridian field notes — 2026-03-15

Ann Chen joined Northwind Labs as a backend engineer. Ann Chen reports to Marco Silva at the Seattle office.

Ann Chen previously interned at Harbor Analytics during 2024.`,
    eventTime: new Date("2026-03-15T12:00:00Z"),
  },
  {
    id: "notes-2026-06-02",
    title: "June 2026 update",
    text: `Ann Chen left Northwind Labs and started at Cascade Research as a staff engineer.`,
    eventTime: new Date("2026-06-02T12:00:00Z"),
  },
] as const

export const UNANSWERABLE_QUESTION =
  "Who leads the tensor compilation roadmap at Zephyr Dynamics?"