import { useMemo, type ComponentProps } from "react"
import { Badge } from "@/components/ui/badge"
import { SandGardenLab } from "@/features/SandGardenLab"
import { supportsWebGL2 } from "@/zen-sand/webgl"

const ZEN_PIN = "8e9b289523e6fdcb19e8be9db5b7ea6a9ccc6c7b"

export default function App() {
  const webgl2 = useMemo(() => supportsWebGL2(), [])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Zen Sand Garden
            </h1>
            <Badge variant="outline">pin {ZEN_PIN.slice(0, 7)}</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Settings-style lab wiring all four real{" "}
            <a
              href="https://github.com/finktheartist/zen-sand-ui"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              Zen Sand UI
            </a>{" "}
            custom elements — classic script tags, no npm package, no clean-room engine.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {!webgl2 ? <WebGLFallbackBanner /> : null}
        <SandGardenLab />
      </main>
    </div>
  )
}

function WebGLFallbackBanner(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      role="alert"
      className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      This browser could not create a WebGL2 context. The Zen Sand controls still accept
      keyboard input, but the sand trays will not draw — this is honest upstream
      behaviour, not a CSS lookalike.
    </div>
  )
}