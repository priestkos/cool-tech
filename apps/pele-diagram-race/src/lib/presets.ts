export type PresetId =
  | "flowchart"
  | "sequence"
  | "gantt"
  | "mindmap"
  | "sankey"
  | "class"
  | "state"

export const PRESETS: Record<PresetId, { label: string; source: string }> = {
  flowchart: {
    label: "Flowchart",
    source: `flowchart LR
  Pele[Pele] -->|renders| SVG[SVG]
  Mermaid[mermaid.js] -->|also| SVG`,
  },
  sequence: {
    label: "Sequence",
    source: `sequenceDiagram
  participant Dev as Developer
  participant P as Pele
  participant M as mermaid.js
  Dev->>P: render(source)
  P-->>Dev: SVG (sync)
  Dev->>M: render(source)
  M-->>Dev: SVG (async)`,
  },
  gantt: {
    label: "Gantt",
    source: `gantt
  title Diagram race
  dateFormat YYYY-MM-DD
  section Build
  Scaffold           :a1, 2026-10-21, 1d
  Wire renderers     :a2, after a1, 1d
  section Compare
  Race x50           :b1, after a2, 1d`,
  },
  mindmap: {
    label: "Mindmap",
    source: `mindmap
  root((Pele Diagram Race))
    Speed
      sync render
      Race x50
    Style
      CSS variables
      no re-render
    Layout
      responsive
      shrink panel`,
  },
  sankey: {
    label: "Sankey",
    source: `sankey-beta
  Pele,Bundle,120
  mermaid.js,Bundle,720
  Pele,Render ms,2
  mermaid.js,Render ms,180`,
  },
  class: {
    label: "Class",
    source: `classDiagram
  class Renderer {
    +render(source)
    +lastMs: number
  }
  class Pele {
    sync
  }
  class MermaidJS {
    async
  }
  Renderer <|-- Pele
  Renderer <|-- MermaidJS`,
  },
  state: {
    label: "State",
    source: `stateDiagram-v2
  [*] --> Editing
  Editing --> Rendering: debounce
  Rendering --> Done: success
  Rendering --> Error: parse fail
  Error --> Editing: fix source
  Done --> Editing: type`,
  },
}

export const DEFAULT_SOURCE = PRESETS.flowchart.source
