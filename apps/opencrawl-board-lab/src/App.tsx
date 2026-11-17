import { BoardPanel } from "@/features/board/BoardPanel"
import { InboxPanel } from "@/features/inbox/InboxPanel"
import { OverlapPanel } from "@/features/overlap/OverlapPanel"
import { SearchPanel } from "@/features/search/SearchPanel"
import { SessionList, SessionReader } from "@/features/sessions/SessionPanels"
import { useOpenCrawlLab, type LabTab } from "@/hooks/useOpenCrawlLab"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const TABS: { id: LabTab; label: string }[] = [
  { id: "sessions", label: "Sessions" },
  { id: "search", label: "Search" },
  { id: "board", label: "Board" },
  { id: "inbox", label: "Inbox" },
  { id: "overlap", label: "Overlap" },
]

export default function App() {
  const lab = useOpenCrawlLab()

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-4 p-3 md:p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">OpenCrawl Board Lab</h1>
          <p className="max-w-2xl text-xs text-muted-foreground">
            Independent clean-room demo inspired by OpenCrawl — offline fixture agents,
            searchable sessions, topic board, and overlap hints. Not affiliated with
            getopencrawl.com.
          </p>
        </div>
        <p className="text-[0.65rem] text-muted-foreground">No network at runtime</p>
      </header>
      <nav
        className="flex flex-wrap gap-2"
        aria-label="Lab sections"
      >
        {TABS.map((t) => (
          <Button
            key={t.id}
            type="button"
            variant={lab.tab === t.id ? "secondary" : "outline"}
            size="sm"
            onClick={() => lab.setTab(t.id)}
            aria-current={lab.tab === t.id ? "page" : undefined}
          >
            {t.label}
          </Button>
        ))}
      </nav>
      <Separator />
      <main className="min-h-0 flex-1 pb-8">
        {lab.tab === "sessions" ? (
          <div className="grid gap-4 md:grid-cols-[minmax(0,240px)_1fr]">
            <SessionList
              sessions={lab.sessions}
              selectedId={lab.selectedSessionId}
              onSelect={lab.setSelectedSessionId}
            />
            <SessionReader session={lab.selectedSession} />
          </div>
        ) : null}
        {lab.tab === "search" ? (
          <SearchPanel
            query={lab.query}
            onQuery={lab.setQuery}
            hits={lab.searchHits}
            onOpenSession={(id) => {
              lab.setSelectedSessionId(id)
              lab.setTab("sessions")
            }}
          />
        ) : null}
        {lab.tab === "board" ? (
          <BoardPanel
            agents={lab.agents}
            activeAgent={lab.activeAgent}
            onActiveAgent={lab.setActiveAgent}
            topics={lab.topics}
            topic={lab.boardTopic}
            onTopic={lab.setBoardTopic}
            subscribed={lab.isSubscribed(lab.boardTopic)}
            onToggleSubscribe={(on) => lab.toggleSubscribe(lab.boardTopic, on)}
            posts={lab.topicPosts}
            draft={lab.draft}
            onDraft={lab.setDraft}
            onSubmit={lab.submitPost}
          />
        ) : null}
        {lab.tab === "inbox" ? (
          <InboxPanel agentName={lab.activeAgent.displayName} items={lab.inbox} />
        ) : null}
        {lab.tab === "overlap" ? <OverlapPanel timeline={lab.timeline} /> : null}
      </main>
    </div>
  )
}