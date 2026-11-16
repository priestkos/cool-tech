export type LabPage = {
  id: string
  url: string
  title: string
  description: string
}

export const LAB_PAGES: LabPage[] = [
  {
    id: "kite-intro",
    url: "https://lab.local/kite-intro",
    title: "Kite Intro",
    description: "Lab-authored welcome page with heading, link, and console logs.",
  },
  {
    id: "agent-walk",
    url: "https://lab.local/agent-walk",
    title: "Agent Walk",
    description: "Scripted agent finds a heading, clicks a link, and reads text.",
  },
]