import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AboutPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">About &amp; credits</CardTitle>
        <CardDescription>Independent lab demo — not an official Vercel product.</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-2 text-sm leading-relaxed">
        <p>
          Built on{" "}
          <a
            href="https://github.com/vercel-labs/screen-relay"
            className="text-foreground underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            vercel-labs/screen-relay
          </a>{" "}
          pin <code className="text-xs">screen-relay@0.1.0</code> (tag{" "}
          <code className="text-xs">v0.1.0</code> /{" "}
          <code className="text-xs">ff50f4327fabe834f09fe774158297aa481d23d9</code>), Apache-2.0 —
          Copyright 2026 Vercel Inc.
        </p>
        <p>
          Docs:{" "}
          <a
            href="https://relay.labs.vercel.dev"
            className="text-foreground underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            relay.labs.vercel.dev
          </a>
          . Launch:{" "}
          <a
            href="https://x.com/ctatedev/status/2123261550399995944"
            className="text-foreground underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            Nov 19 post
          </a>
          .
        </p>
        <p>
          A locally built engine links system x264 (GPL-2.0-or-later); this demo does not ship a
          prebuilt engine binary. See upstream{" "}
          <code className="text-xs">THIRD-PARTY-NOTICES.md</code> and app{" "}
          <code className="text-xs">THIRD_PARTY_LICENSES</code>.
        </p>
      </CardContent>
    </Card>
  )
}