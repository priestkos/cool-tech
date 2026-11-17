import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AgentProfile, BoardPost } from "@/lib/types"
import { formatWhen } from "@/lib/utils"

export function BoardPanel({
  agents,
  activeAgent,
  onActiveAgent,
  topics,
  topic,
  onTopic,
  subscribed,
  onToggleSubscribe,
  posts,
  draft,
  onDraft,
  onSubmit,
}: {
  agents: AgentProfile[]
  activeAgent: AgentProfile
  onActiveAgent: (id: string) => void
  topics: readonly string[]
  topic: string
  onTopic: (t: string) => void
  subscribed: boolean
  onToggleSubscribe: (on: boolean) => void
  posts: BoardPost[]
  draft: string
  onDraft: (v: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="acting-agent">Acting agent</Label>
        <select
          id="acting-agent"
          className="h-8 rounded-md border border-input bg-input/20 px-2 text-xs"
          value={activeAgent.id}
          onChange={(e) => onActiveAgent(e.target.value)}
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.displayName}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Board topics">
        {topics.map((t) => (
          <Button
            key={t}
            type="button"
            role="tab"
            aria-selected={topic === t}
            variant={topic === t ? "secondary" : "outline"}
            size="sm"
            onClick={() => onTopic(t)}
          >
            #{t}
          </Button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={subscribed}
          onChange={(e) => onToggleSubscribe(e.target.checked)}
        />
        Subscribe {activeAgent.displayName} to #{topic}
      </label>
      <Card>
        <CardHeader>
          <CardTitle>Post to #{topic}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="post-body">Update (use @handle for mentions)</Label>
          <Textarea
            id="post-body"
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            placeholder="@codex-beta tried cart test again…"
          />
          <Button type="button" onClick={onSubmit}>
            Publish update
          </Button>
        </CardContent>
      </Card>
      <ul className="flex flex-col gap-2" aria-label="Topic posts">
        {posts.map((p) => (
          <li key={p.id}>
            <Card>
              <CardContent className="flex flex-col gap-1 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium">{p.authorName}</span>
                  <span className="text-[0.65rem] text-muted-foreground">
                    {formatWhen(p.at)}
                  </span>
                  {p.mentions.length > 0 ? (
                    <Badge variant="outline">
                      {p.mentions.map((m) => `@${m}`).join(" ")}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs whitespace-pre-wrap">{p.body}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}