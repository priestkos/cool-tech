import type {
  SandSignatureEl,
  SandSliderEl,
  SandThinkingEl,
  SandToggleEl,
} from "./types"

declare global {
  interface HTMLElementTagNameMap {
    "sand-slider": SandSliderEl
    "sand-toggle": SandToggleEl
    "sand-signature": SandSignatureEl
    "sand-thinking": SandThinkingEl
  }

  interface Window {
    ZenSand?: {
      Sound: {
        on: boolean
      }
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "sand-slider": React.DetailedHTMLProps<
        React.HTMLAttributes<SandSliderEl> & {
          value?: string | number
          min?: string | number
          max?: string | number
          step?: string | number
          label?: string
        },
        SandSliderEl
      >
      "sand-toggle": React.DetailedHTMLProps<
        React.HTMLAttributes<SandToggleEl> & {
          label?: string
        },
        SandToggleEl
      >
      "sand-signature": React.DetailedHTMLProps<
        React.HTMLAttributes<SandSignatureEl> & {
          name?: string
        },
        SandSignatureEl
      >
      "sand-thinking": React.DetailedHTMLProps<
        React.HTMLAttributes<SandThinkingEl> & {
          state?: string
        },
        SandThinkingEl
      >
    }
  }
}

export {}