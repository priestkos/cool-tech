import type { DetailedHTMLProps, HTMLAttributes } from 'react'

export type HyperframesPlayerElement = HTMLElement & {
  seek: (seconds: number) => void
  play: () => void
  pause: () => void
  currentTime: number
  duration: number
  compositionWidth: number
  compositionHeight: number
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'hyperframes-player': DetailedHTMLProps<
        HTMLAttributes<HyperframesPlayerElement> & {
          src?: string
          srcdoc?: string
          width?: number | string
          height?: number | string
          controls?: boolean
          'assets-loading-ui'?: 'player' | 'none'
        },
        HyperframesPlayerElement
      >
    }
  }
}
