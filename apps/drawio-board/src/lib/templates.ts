export type TemplateId = "flowchart" | "architecture" | "org-chart"

export type StarterTemplate = {
  id: TemplateId
  title: string
  description: string
  xml: string
}

const flowchartXml = `<mxfile host="app.diagrams.net">
  <diagram id="flow" name="Flowchart">
    <mxGraphModel dx="900" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="start" value="Start" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="340" y="80" width="120" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="decide" value="Ready?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="330" y="180" width="140" height="80" as="geometry"/>
        </mxCell>
        <mxCell id="ship" value="Ship it" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="520" y="300" width="120" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="fix" value="Fix it" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
          <mxGeometry x="160" y="300" width="120" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="start" target="decide">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="e2" value="Yes" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="decide" target="ship">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="e3" value="No" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="decide" target="fix">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="e4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="fix" target="decide">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="220" y="220"/>
            </Array>
          </mxGeometry>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`

const architectureXml = `<mxfile host="app.diagrams.net">
  <diagram id="arch" name="Architecture">
    <mxGraphModel dx="900" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="client" value="Web client" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="120" y="200" width="140" height="70" as="geometry"/>
        </mxCell>
        <mxCell id="api" value="API service" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="355" y="200" width="140" height="70" as="geometry"/>
        </mxCell>
        <mxCell id="db" value="Database" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="590" y="185" width="120" height="100" as="geometry"/>
        </mxCell>
        <mxCell id="cache" value="Cache" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1">
          <mxGeometry x="355" y="340" width="140" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="a1" value="HTTPS" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="client" target="api">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="a2" value="SQL" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="api" target="db">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="a3" value="read-through" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="api" target="cache">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`

const orgChartXml = `<mxfile host="app.diagrams.net">
  <diagram id="org" name="Org chart">
    <mxGraphModel dx="900" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="ceo" value="Director" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="365" y="60" width="120" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="eng" value="Engineering" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="180" y="180" width="120" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="prod" value="Product" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="365" y="180" width="120" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="ops" value="Operations" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="550" y="180" width="120" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="o1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="ceo" target="eng">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="o2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="ceo" target="prod">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="o3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="ceo" target="ops">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "flowchart",
    title: "Flowchart",
    description: "Decision loop with start, branch, and rework.",
    xml: flowchartXml,
  },
  {
    id: "architecture",
    title: "Architecture",
    description: "Client, API, database, and cache.",
    xml: architectureXml,
  },
  {
    id: "org-chart",
    title: "Org chart",
    description: "Director with three teams.",
    xml: orgChartXml,
  },
]

export const DEFAULT_MERMAID = `graph TD
  A[Start] --> B{Ready?}
  B -->|Yes| C[Ship it]
  B -->|No| D[Fix it]
  D --> B`
