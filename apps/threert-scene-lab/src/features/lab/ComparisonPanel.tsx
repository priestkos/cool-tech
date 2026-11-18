import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const LINKS = [
  {
    href: "https://threert.dev",
    label: "ThreeRT site (threert.dev)",
  },
  {
    href: "https://github.com/meshy-dev/ThreeRT",
    label: "ThreeRT GitHub repository",
  },
  {
    href: "https://www.npmjs.com/package/@threert/scene/v/0.1.1",
    label: "npm @threert/scene@0.1.1",
  },
  {
    href: "https://x.com/ThreeRT3D/status/2121238880808829385",
    label: "ThreeRT launch post (Meshy, Nov 2026)",
  },
]

export function ComparisonPanel() {
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Browser three.js vs native ThreeRT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">This lab</strong> builds scenes with
            the official <code className="text-[10px]">@threert/scene</code> package
            (lux sun, SkyAtmosphere, cd lights, nits emissive). The right pane mirrors
            that graph into real three.js for a conventional raster preview — the same
            split described in the upstream README.
          </p>
          <p>
            <strong className="text-foreground">ThreeRT&apos;s native macOS/iOS clients</strong>{" "}
            path-trace the bundle with hardware ray tracing (soft sun disks, traced
            emissive and area lights). Vite cannot run that engine in-browser; we do
            not fake path tracing here.
          </p>
          <p>
            Official side-by-side stills live on{" "}
            <a
              className="text-primary underline underline-offset-2 hover:text-foreground"
              href="https://threert.dev"
              rel="noopener noreferrer"
              target="_blank"
            >
              threert.dev
            </a>{" "}
            — linked below, not copied into this repo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Credit &amp; upstream links</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-primary underline underline-offset-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Pinned upstream: npm @threert/scene@0.1.1 (2026-11-13 UTC), Git commit
            1aae0b7f (MIT). See THIRD_PARTY_LICENSES and package README in this app.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}