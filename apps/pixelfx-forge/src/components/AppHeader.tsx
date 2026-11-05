export function AppHeader() {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Unofficial community demo. Not affiliated with patch-gg / Patch, Hugo Duprez or Sprite
            Fusion. Effects by pixelfx (MIT).
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">PixelFX Forge</h1>
          <p className="text-sm text-muted-foreground">
            Browse, tune, recolor, arena-play, and export sprite sheets from 244 pixelfx effects.
          </p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm">
          <a
            className="text-primary underline-offset-4 hover:underline"
            href="https://github.com/patch-gg/pixelfx"
            rel="noopener noreferrer"
            target="_blank"
          >
            pixelfx repo
          </a>
          <a
            className="text-primary underline-offset-4 hover:underline"
            href="https://patch-gg.github.io/pixelfx/"
            rel="noopener noreferrer"
            target="_blank"
          >
            upstream gallery
          </a>
          <a
            className="text-primary underline-offset-4 hover:underline"
            href="https://x.com/Mnilax/status/2117326790930907173"
            rel="noopener noreferrer"
            target="_blank"
          >
            source buzz
          </a>
        </nav>
      </div>
    </header>
  );
}
