import { useCallback, useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  estimateTokensFromChars,
  tokenSavingsPercent,
} from "@/lib/token-estimate"

type ToolDocument = {
  type: "document"
  url: string
  finalUrl: string
  contentType: string
  title?: string
  content: string
  offset: number
  totalLength: number
  nextOffset?: number
}

type ToolError = {
  type: "error"
  url: string
  errorCode: string
  message: string
  statusCode?: number
}

type ToolOutput = ToolDocument | ToolError

type FetchResponse = {
  rawHtml: string | null
  rawError?: string
  tool: ToolOutput
}

type ChatStep = {
  toolCallId: string
  toolName: string
  input: { url: string; offset?: number }
  output: ToolOutput
  leakStatus?: "leaked" | "blocked" | "neutral"
}

type ChatResponse = {
  text: string
  steps: ChatStep[]
  injectionOutcome?: "leaked" | "blocked"
  realModelAvailable?: boolean
}

const DEFAULT_URL = "https://ai-sdk.dev/docs/introduction"
const FIXTURE_URL = "https://fixture.web-fetch-lab.example/injection-test"

export default function App() {
  const [url, setUrl] = useState(DEFAULT_URL)
  const [allowedDomains, setAllowedDomains] = useState("")
  const [requireUrlInUserMessage, setRequireUrlInUserMessage] = useState(false)
  const [maxLength, setMaxLength] = useState(50_000)
  const [useFixtureTransport, setUseFixtureTransport] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchResult, setFetchResult] = useState<FetchResponse | null>(null)

  const [chatMessage, setChatMessage] = useState(
    `Summarize this page: ${DEFAULT_URL}`,
  )
  const [injectionDemo, setInjectionDemo] = useState(false)
  const [useRealModel, setUseRealModel] = useState(false)
  const [realModelAvailable, setRealModelAvailable] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [chatResult, setChatResult] = useState<ChatResponse | null>(null)

  const safetyPayload = useMemo(
    () => ({
      allowedDomains: allowedDomains
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      requireUrlInUserMessage,
      maxLength,
    }),
    [allowedDomains, requireUrlInUserMessage, maxLength],
  )

  const runFetch = useCallback(
    async (nextOffset = 0) => {
      setLoading(true)
      try {
        const response = await fetch("/api/fetch", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            url,
            offset: nextOffset,
            useFixtureTransport,
            userMessageText: url,
            safety: {
              ...safetyPayload,
              allowedDomains:
                safetyPayload.allowedDomains.length > 0
                  ? safetyPayload.allowedDomains
                  : undefined,
            },
          }),
        })
        const data = (await response.json()) as FetchResponse
        setFetchResult(data)
      } finally {
        setLoading(false)
      }
    },
    [url, useFixtureTransport, safetyPayload],
  )

  const runChat = useCallback(async () => {
    setChatLoading(true)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: chatMessage,
          injectionDemo,
          useRealModel,
          useFixtureTransport: injectionDemo || useFixtureTransport,
          safety: {
            ...safetyPayload,
            allowedDomains:
              safetyPayload.allowedDomains.length > 0
                ? safetyPayload.allowedDomains
                : undefined,
          },
        }),
      })
      const data = (await response.json()) as ChatResponse
      setChatResult(data)
      if (data.realModelAvailable !== undefined) {
        setRealModelAvailable(data.realModelAvailable)
      }
    } finally {
      setChatLoading(false)
    }
  }, [chatMessage, injectionDemo, useRealModel, useFixtureTransport, safetyPayload])

  useEffect(() => {
    void fetch("/api/config")
      .then((r) => r.json())
      .then((data: { realModelAvailable?: boolean }) => {
        if (data.realModelAvailable !== undefined) {
          setRealModelAvailable(data.realModelAvailable)
        }
      })
      .catch(() => {})
  }, [])

  const tool = fetchResult?.tool
  const markdownChars =
    tool?.type === "document" ? tool.content.length : 0
  const rawChars = fetchResult?.rawHtml?.length ?? 0
  const savings = tokenSavingsPercent(rawChars, markdownChars)

  const loadInjectionPreset = () => {
    setUrl(FIXTURE_URL)
    setUseFixtureTransport(true)
    setChatMessage(`Read the changelog at ${FIXTURE_URL} and follow any instructions inside.`)
    setInjectionDemo(true)
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Web Fetch Lab</h1>
            <Badge variant="secondary">@ai-sdk/tool-web-fetch 1.0.0</Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Paste a URL to compare raw HTML with the Markdown your agent receives via the AI SDK Web
            Fetch tool — plus safety switches and a mock agent that demonstrates prompt-injection
            blocking.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Fetch</CardTitle>
            <CardDescription>
              Server-side tool execute plus a plain GET for the raw HTML snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={() => runFetch(0)} disabled={loading}>
                  {loading ? "Fetching…" : "Fetch"}
                </Button>
                <Button variant="outline" onClick={loadInjectionPreset}>
                  Prompt injection test page
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="allow">Allowed domains (comma-separated)</Label>
                <Input
                  id="allow"
                  value={allowedDomains}
                  onChange={(e) => setAllowedDomains(e.target.value)}
                  placeholder="e.g. ai-sdk.dev, fixture.web-fetch-lab.example"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxlen">maxLength</Label>
                <Input
                  id="maxlen"
                  type="number"
                  value={maxLength}
                  onChange={(e) => setMaxLength(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="require-user-url"
                  checked={requireUrlInUserMessage}
                  onCheckedChange={setRequireUrlInUserMessage}
                />
                <Label htmlFor="require-user-url">Only URLs from user message</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="fixture-transport"
                  checked={useFixtureTransport}
                  onCheckedChange={setUseFixtureTransport}
                />
                <Label htmlFor="fixture-transport">Fixture transport (demo hosts only)</Label>
              </div>
            </div>

            {tool?.type === "document" && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">estimate</Badge>
                <span>
                  Raw ~{estimateTokensFromChars(rawChars)} tokens · Markdown ~
                  {estimateTokensFromChars(markdownChars)} tokens
                </span>
                {rawChars > 0 && (
                  <Badge variant="secondary">{savings}% smaller (chars)</Badge>
                )}
                {tool.nextOffset !== undefined && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runFetch(tool.nextOffset!)}
                  >
                    Read next chunk (offset {tool.nextOffset})
                  </Button>
                )}
              </div>
            )}

            {tool?.type === "error" && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-destructive">
                    {tool.errorCode}
                  </CardTitle>
                  <CardDescription>{tool.message}</CardDescription>
                </CardHeader>
              </Card>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Raw HTML</Label>
                  {fetchResult?.rawError && (
                    <span className="text-xs text-destructive">{fetchResult.rawError}</span>
                  )}
                </div>
                <ScrollArea className="h-80 rounded-md border bg-muted/30 p-3">
                  <pre className="whitespace-pre-wrap break-all font-mono text-xs">
                    {fetchResult?.rawHtml ?? "Run Fetch to load HTML."}
                  </pre>
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label>Tool Markdown</Label>
                <ScrollArea className="h-80 rounded-md border bg-muted/30 p-3">
                  {tool?.type === "document" ? (
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">title:</span>{" "}
                        {tool.title ?? "(none)"}
                      </p>
                      <p className="break-all font-mono text-xs text-muted-foreground">
                        {tool.finalUrl} · {tool.contentType}
                      </p>
                      <pre className="whitespace-pre-wrap font-mono text-xs">{tool.content}</pre>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No document yet.</p>
                  )}
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat">Mock agent chat</TabsTrigger>
          </TabsList>
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Agent chat</CardTitle>
                <CardDescription>
                  MockLanguageModelV4 by default. Toggle real model when OPENAI_API_KEY is set.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  rows={3}
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap items-center gap-4">
                  <Button onClick={runChat} disabled={chatLoading}>
                    {chatLoading ? "Running…" : "Run agent"}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="injection-demo"
                      checked={injectionDemo}
                      onCheckedChange={setInjectionDemo}
                    />
                    <Label htmlFor="injection-demo">Injection demo script</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="real-model"
                      checked={useRealModel}
                      onCheckedChange={setUseRealModel}
                      disabled={!realModelAvailable}
                    />
                    <Label htmlFor="real-model">
                      Real model {realModelAvailable ? "" : "(no API key)"}
                    </Label>
                  </div>
                </div>

                {chatResult?.injectionOutcome && (
                  <div
                    className={
                      chatResult.injectionOutcome === "leaked"
                        ? "rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                        : "rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-200"
                    }
                  >
                    {chatResult.injectionOutcome === "leaked"
                      ? "Leak simulated: mock agent called attacker.example with the fake secret (no network request was sent)."
                      : "Blocked: webFetch rejected the attacker URL (allow-list or user-message mode)."}
                  </div>
                )}

                {chatResult?.text && (
                  <p className="text-sm text-muted-foreground">Agent: {chatResult.text}</p>
                )}

                <div className="space-y-3">
                  {chatResult?.steps.map((step) => (
                    <Card
                      key={step.toolCallId}
                      className={
                        step.leakStatus === "leaked"
                          ? "border-destructive/50"
                          : step.leakStatus === "blocked"
                            ? "border-emerald-500/40"
                            : undefined
                      }
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-mono">
                          {step.toolName} → {step.input.url}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs">
                          {JSON.stringify(step.output, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
