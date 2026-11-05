import type { MermaidConfig } from "mermaid"

// Mermaid inserts temporary SVG into the live DOM during render. Prevent source
// directives/frontmatter from injecting CSS before the final SVG is sanitized.
export const MERMAID_CONFIG: MermaidConfig = {
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "strict",
  htmlLabels: false,
  secure: [
    "secure", "securityLevel", "startOnLoad", "maxTextSize", "maxEdges",
    "suppressErrorRendering", "themeCSS", "fontFamily", "altFontFamily",
    "themeVariables", "htmlLabels",
  ],
}
