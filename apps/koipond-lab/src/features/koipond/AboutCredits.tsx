import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AboutCredits() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            About
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-md" side="left">
        <SheetHeader>
          <SheetTitle>Credits &amp; licenses</SheetTitle>
          <SheetDescription>
            Independent cool-tech demo — not affiliated with the koipond authors.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-3">
          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              Pond rendering uses the published npm package{" "}
              <strong>@hxlfed/koipond@0.1.0</strong> (MIT). Copyright (c) 2026 koipond
              contributors.
            </p>
            <p>
              Peer dependency <strong>three@0.187.0</strong> (MIT). Inspired by{" "}
              <a
                href="https://github.com/msk1039/nagomi"
                className="underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                nagomi
              </a>{" "}
              — no shared code.
            </p>
            <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-xs">
              <li>
                Upstream:{" "}
                <a
                  href="https://github.com/Himanshu-Sangshetti/koipond"
                  className="text-foreground underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  github.com/Himanshu-Sangshetti/koipond
                </a>
              </li>
              <li>
                npm:{" "}
                <a
                  href="https://www.npmjs.com/package/@hxlfed/koipond"
                  className="text-foreground underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  @hxlfed/koipond
                </a>
              </li>
              <li>Reference demo (not loaded at runtime): koipond-demo.vercel.app</li>
            </ul>
            <p className="text-muted-foreground text-xs">
              Full water needs WebGL2; otherwise the component&apos;s built-in stylised fallback
              applies. The simulation pauses off-screen. With{" "}
              <code className="text-[0.7rem]">prefers-reduced-motion</code> the pond shows a still
              frame per upstream behaviour.
            </p>
            <p className="text-muted-foreground text-xs">
              See <code>THIRD_PARTY_LICENSES</code> and the app README for install provenance.
            </p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}