import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function KitesurfExplainer() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>What Kitesurf replaces</CardTitle>
        <CardDescription>
          Independent demo — not affiliated with Cloudflare.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          <a
            href="https://kitesurf.dev"
            className="text-foreground underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            Kitesurf
          </a>{" "}
          is a stateless browser for AI agents on Workers: HTML/CSS/JS without a
          headless Chrome container, speaking Chrome DevTools Protocol (CDP) over
          WebSocket.
        </p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <span className="text-foreground">Replaces:</span> long-lived browser
            pods, Puppeteer sidecars, screenshot microservices.
          </li>
          <li>
            <span className="text-foreground">Limits:</span> not full Chromium
            fidelity — no extensions, limited devtools surface, user must run the
            server for live mode.
          </li>
          <li>
            <span className="text-foreground">This lab:</span> replays original CDP
            fixtures offline; live mode only opens{" "}
            <code className="text-foreground">ws://127.0.0.1:8787</code> when you
            toggle it.
          </li>
        </ul>
        <p className="text-[0.65rem]">
          Links:{" "}
          <a
            href="https://github.com/cloudflare/kitesurf"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            github.com/cloudflare/kitesurf
          </a>
          {" · "}
          <a
            href="https://blog.cloudflare.com/kitesurf-open-source/"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            launch blog
          </a>
          {" · "}
          <a
            href="https://x.com/celso/status/2120994509551223020"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            launch post
          </a>
        </p>
      </CardContent>
    </Card>
  )
}