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
            <strong className="text-foreground">This demo</strong> renders only the
            conventional three.js WebGL path: shadow-mapped lights, tone-mapped
            rasterization, and emissive materials. It runs fully offline in your
            browser.
          </p>
          <p>
            <strong className="text-foreground">ThreeRT&apos;s native macOS/iOS clients</strong>{" "}
            add hardware path tracing: sun disks in physical lux without shadow-map
            artifacts, emissive and area lights traced in-path, and higher-fidelity
            comparisons against plain three.js. We do not simulate path tracing here.
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
            and in the{" "}
            <a
              className="text-primary underline underline-offset-2 hover:text-foreground"
              href="https://github.com/meshy-dev/ThreeRT"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub repo
            </a>
            — linked below; images are not copied into this lab.
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
            Independent clean-room recreation inspired by ThreeRT. No @threert/*
            packages, no vendored ThreeRT source, scenes, or images. @threert/scene
            may be revisited after ~16 Nov 2026 06:05 IST eligibility window.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}