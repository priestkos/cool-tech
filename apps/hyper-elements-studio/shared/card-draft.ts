export type StudioRoot = "email" | "page" | "document" | "canvas"

export type CardDraft = {
  heading: string
  body: string
  buttonLabel: string
  buttonHref: string
  /** Plants marginBottom on body text (validation error). */
  plantLayoutError: boolean
  /** Plants a web-font-only stack on Email (render warning with fix). */
  plantEmailFix: boolean
}

export const DEFAULT_DRAFT: CardDraft = {
  heading: "Welcome to Hyper Elements Studio",
  body: "One editable card tree, four official roots — email-safe HTML, responsive web, PDF, and PNG/SVG image.",
  buttonLabel: "Read the docs",
  buttonHref: "https://hyperelements.dev/",
  plantLayoutError: false,
  plantEmailFix: false,
}
