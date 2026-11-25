import { Button } from "@/components/panelo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/panelo/ui/dialog"

const LINKS = [
  { href: "https://github.com/raycanvas-ai/paneloui", label: "Panelo UI (MIT)" },
  { href: "https://paneloui.com", label: "paneloui.com (reference)" },
  { href: "https://ui-sdk.dev", label: "UI SDK" },
  { href: "https://github.com/vercel-labs/ui", label: "Vercel UI SDK source" },
  {
    href: "https://x.com/shadcnlabs/status/2125221634101723255",
    label: "Shadcn Labs launch post",
  },
]

export function AboutCredits() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          About & licenses
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Panelo Agent Dashboard lab</DialogTitle>
          <DialogDescription>
            Independent demo — not affiliated with Raycanvas or Vercel. Sources pinned at git{" "}
            <code className="text-xs">6517e2e7062f97501e46e73ba1e545f19ef556e2</code> and{" "}
            <code className="text-xs">@ui-sdk/core@0.1.0-beta.2</code>.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a className="text-primary hover:underline" href={l.href}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Panelo components: Copyright (c) 2026 Panelo, MIT. UI SDK: Copyright 2026 Vercel, Inc., Apache-2.0. Pro
          dashboard pages are not vendored; this lab uses the free Home Care Schedule and free charts only.
        </p>
      </DialogContent>
    </Dialog>
  )
}