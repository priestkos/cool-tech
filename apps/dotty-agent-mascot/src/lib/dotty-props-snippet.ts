import type { ExpressionName, ShapeName, StateName } from 'dotty-botty'

export function buildDottyPropsSnippet(options: {
  state: StateName
  shape: ShapeName
  expression: ExpressionName | null
  size: number
  ink: string
  spot: string
  followPointer: boolean
  reducedMotion: boolean
  pokeable: boolean
}): string {
  const lines = [
    '<DottyBotty',
    `  state="${options.state}"`,
    `  shape="${options.shape}"`,
  ]
  if (options.expression) {
    lines.push(`  expression="${options.expression}"`)
  } else {
    lines.push('  expression={null}')
  }
  lines.push(`  size={${options.size}}`)
  lines.push(`  ink="${options.ink}"`)
  lines.push(`  spot="${options.spot}"`)
  lines.push(`  followPointer={${options.followPointer}}`)
  lines.push(`  reducedMotion={${options.reducedMotion}}`)
  lines.push('  label="Agent mascot"')
  if (options.pokeable) {
    lines.push('  pokeable')
  }
  lines.push('/>')
  return lines.join('\n')
}
