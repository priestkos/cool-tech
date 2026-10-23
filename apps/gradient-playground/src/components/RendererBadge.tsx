import { useEffect, useState } from 'react'
import { backendFor } from '@/lib/gradient-engine/backend'
import type { BackendName } from '@/lib/gradient-engine/backend'
import type { GradientKind } from '@/lib/gradient-engine'
import { onWebGPUChange } from '@/lib/gradient-engine/webgpu'
import { Badge } from '@/components/ui/badge'

function resolveBackend(kind: GradientKind): BackendName {
  return backendFor(kind).name
}

export function RendererBadge({ kind }: { kind: GradientKind }) {
  const [backend, setBackend] = useState<BackendName>(() => resolveBackend(kind))

  useEffect(() => {
    const sync = () => setBackend(resolveBackend(kind))
    sync()
    return onWebGPUChange(sync)
  }, [kind])

  const label = backend === 'webgpu' ? 'WebGPU' : 'WebGL2 fallback'

  return (
    <Badge variant="secondary" className="border-border/60 bg-background/75 backdrop-blur-sm">
      Renderer: {label}
    </Badge>
  )
}
