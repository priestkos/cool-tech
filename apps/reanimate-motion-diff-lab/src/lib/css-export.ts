import { easingToCss } from "./bezier"
import type { AnimationSpec } from "./types"

export function exportAnimationCss(spec: AnimationSpec, className = "motion-copy"): string {
  const kfs = [...spec.keyframes].sort((a, b) => a.offset - b.offset)
  const lines = kfs.map((k) => {
    const pct = Math.round(k.offset * 1000) / 10
    return `  ${pct}% {
    transform: translateY(${k.translateY}px) scale(${k.scale});
    opacity: ${k.opacity};
  }`
  })

  return `@keyframes ${className}-enter {
${lines.join("\n")}
}

.${className} {
  animation: ${className}-enter ${spec.durationMs}ms ${easingToCss(spec.easing)} ${spec.delayMs}ms both;
}`
}
