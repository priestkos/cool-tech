import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemeMode } from "@/hooks/use-theme";

export function StudioHeader({
  theme,
  onToggleTheme,
}: {
  theme: ThemeMode;
  onToggleTheme: () => void;
}) {
  return (
    <header className="border-b bg-card/40 px-4 py-4 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1 text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Unofficial demo. Not Bklit Studio and not affiliated with Bklit.
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Bklit Chart Studio
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Paste a dataset or pick a sample to preview Bklit area, candlestick, funnel, and radar
            charts side by side. Charts are installed from the shadcn registry at commit{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">f028db2</code>.
          </p>
          <nav className="flex flex-wrap gap-3 pt-1 text-sm">
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="https://github.com/bklit/bklit-ui"
              target="_blank"
              rel="noreferrer"
            >
              Bklit UI repo
            </a>
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="https://ui.bklit.com"
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </a>
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="https://x.com/uixmat/status/2115528918748774462"
              target="_blank"
              rel="noreferrer"
            >
              Source post on X
            </a>
          </nav>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 self-start"
          onClick={onToggleTheme}
          aria-label="Toggle light and dark theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>
    </header>
  );
}
