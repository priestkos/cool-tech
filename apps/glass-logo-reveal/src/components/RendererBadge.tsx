import { Badge } from '@/components/ui/badge'

type RendererKind = 'webgl2' | 'static'

export function RendererBadge({ kind }: { kind: RendererKind }) {
  if (kind === 'webgl2') {
    return <Badge variant="secondary">WebGL 2 renderer</Badge>
  }
  return (
    <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-300">
      WebGL 2 unavailable — static preview
    </Badge>
  )
}
