export function ScreenshotView({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-border/70 bg-muted/20">
      <img
        src={src}
        alt={alt}
        className="aspect-[8/5] w-full object-cover"
        width={640}
        height={400}
      />
    </div>
  )
}