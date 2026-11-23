import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AboutCredits() {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">About & credits</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-3 text-xs leading-relaxed">
        <p>
          Independent demo lab — not affiliated with Arrival.Space. Plays Animated SOG (MIT) via the vendored
          decoder at commit{" "}
          <a
            href="https://github.com/arrival-space/animated-sog/tree/69e2de220813904f8ac9c4b69841b21468ca160c"
            className="text-foreground underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            69e2de2
          </a>
          .
        </p>
        <p>
          TRiGS motion model: Yeom, Nam, Choi et al.,{" "}
          <em>Temporal Rigid-Body Motion for Scalable 4D Gaussian Splatting</em>.
        </p>
        <p>
          Copyright (c) 2026 Arrival.Space — MIT License. See{" "}
          <code className="text-[0.65rem]">THIRD_PARTY_LICENSES.md</code> in the app folder.
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <a
              href="https://github.com/arrival-space/animated-sog"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              github.com/arrival-space/animated-sog
            </a>
          </li>
          <li>
            <a
              href="https://arrival.space"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              arrival.space
            </a>
          </li>
          <li>
            <a
              href="https://arrival-space.github.io/animated-sog/examples/three/"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              Official three.js viewer
            </a>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}