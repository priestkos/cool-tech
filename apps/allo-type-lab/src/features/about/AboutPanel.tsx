import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AboutPanel() {
  return (
    <Card id="about">
      <CardHeader>
        <CardTitle>About Allo</CardTitle>
        <CardDescription>
          Independent demo — not affiliated with Josh Puckett or the official Allo project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed">
        <p>
          This lab bundles the real{" "}
          <a
            href="https://allo.joshpuckett.me"
            className="underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            Allo
          </a>{" "}
          variable typeface ({""}
          <a
            href="https://github.com/joshpuckett/allo"
            className="underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            source
          </a>
          ,{" "}
          <a
            href="https://x.com/joshpuckett/status/2122329345670988258"
            className="underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            launch post
          </a>
          ) via npm <code className="text-xs">allo-font@1.0.0</code> (SIL OFL 1.1). Font files ship locally;
          nothing loads from a CDN at runtime.
        </p>
        <p className="text-muted-foreground text-xs">
          Reserved Font Name: Allo. See <code>THIRD_PARTY_LICENSES.md</code> and bundled{" "}
          <code>OFL.txt</code> / <code>LICENSE.txt</code> from the package for the full license.
        </p>
        <details className="rounded-md border border-border p-3">
          <summary className="cursor-pointer font-medium">OFL 1.1 summary</summary>
          <p className="text-muted-foreground mt-2 text-xs">
            Allo is licensed under the SIL Open Font License 1.1. You may use, modify, and redistribute it with
            software, including commercially, as long as the fonts are not sold by themselves. This demo preserves the
            copyright and license notices from the npm package.
          </p>
        </details>
      </CardContent>
    </Card>
  )
}