import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function AboutCreditsDialog() {
  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        About & credits
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dissolve Dust Lab</DialogTitle>
          <DialogDescription>
            Independent cool-tech demo — not affiliated with dissolve-ui.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Web components and grain engine copied from{" "}
            <a
              href="https://github.com/dissolve-ui/dissolve"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              dissolve-ui/dissolve
            </a>{" "}
            (earlier{" "}
            <a
              href="https://github.com/rs-4/dissolve"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              rs-4/dissolve
            </a>
            ) at commit{" "}
            <code className="text-xs">06eddec</code> / npm{" "}
            <a
              href="https://www.npmjs.com/package/dissolve-ui/v/0.0.6"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              dissolve-ui@0.0.6
            </a>{" "}
            via <code className="text-xs">bunx dissolve-ui@0.0.6 add …</code> — not a live registry
            fetch.
          </p>
          <p className="text-muted-foreground text-xs">
            MIT License — Copyright (c) 2026 Rayan Selmi. See THIRD_PARTY_LICENSES and{" "}
            <a
              href="https://dissolve.rselmi.com"
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              dissolve.rselmi.com
            </a>
            . Launch ref:{" "}
            <a
              href="https://x.com/rsStats_/status/2124194035703398830"
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              @rsStats_
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}