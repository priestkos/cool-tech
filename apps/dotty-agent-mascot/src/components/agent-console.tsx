import { useState } from 'react'
import { SendIcon } from 'lucide-react'
import type { AgentLogLine, AgentRunnerState } from '@/lib/agent-script-runner'
import { SCRIPTED_PROMPTS } from '@/lib/agent-script-runner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

function logLabel(line: AgentLogLine) {
  switch (line.kind) {
    case 'user':
      return 'You'
    case 'tool':
      return 'Tool'
    case 'assistant':
      return 'Agent'
    case 'error':
      return 'Error'
    default: {
      const _never: never = line
      return _never
    }
  }
}

function logVariant(line: AgentLogLine) {
  if (line.kind === 'error') return 'destructive' as const
  if (line.kind === 'tool') return 'secondary' as const
  return 'outline' as const
}

interface AgentConsoleProps {
  state: AgentRunnerState
  onTyping: () => void
  onSend: (prompt: string) => void
}

export function AgentConsole({ state, onTyping, onSend }: AgentConsoleProps) {
  const [draft, setDraft] = useState('')

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <Card className="flex h-full min-h-[420px] flex-col">
      <CardHeader>
        <CardTitle>Simulated agent console</CardTitle>
        <CardDescription>
          Scripted prompts replay tool calls and replies. Free text gets a
          canned answer.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {SCRIPTED_PROMPTS.map((script) => (
            <Button
              key={script.id}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setDraft(script.label)
                onTyping()
              }}
            >
              {script.label}
            </Button>
          ))}
        </div>
        <ScrollArea className="h-52 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex flex-col gap-3 pr-2">
            {state.log.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Send a prompt to start a fake run.
              </p>
            ) : (
              state.log.map((line, index) => (
                <div key={`${index}-${line.kind}`} className="flex flex-col gap-1">
                  <Badge variant={logVariant(line)}>{logLabel(line)}</Badge>
                  <p className="text-sm whitespace-pre-wrap">{line.text}</p>
                </div>
              ))
            )}
            {state.streamingText ? (
              <div className="flex flex-col gap-1">
                <Badge variant="outline">Agent</Badge>
                <p className="text-sm whitespace-pre-wrap">
                  {state.streamingText}
                  <span className="animate-pulse">▍</span>
                </p>
              </div>
            ) : null}
          </div>
        </ScrollArea>
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Type a prompt…"
            value={draft}
            rows={3}
            onChange={(event) => {
              setDraft(event.target.value)
              if (event.target.value.length > 0) onTyping()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
          />
          <Button type="button" onClick={submit}>
            <SendIcon data-icon="inline-start" />
            Send (simulated)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
