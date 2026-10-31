import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

export const A2UI_VERSION = "v1.0" as const;
export const CATALOG_ID = standardUI.id;

export interface SampleComponent {
  id: string;
  component: string;
  [prop: string]: unknown;
}

export interface A2UIOperation {
  version: typeof A2UI_VERSION;
  createSurface?: {
    surfaceId: string;
    catalogId?: string;
    dataModel?: Record<string, unknown>;
    components?: SampleComponent[];
  };
  updateDataModel?: {
    surfaceId: string;
    path: string;
    value: unknown;
  };
  updateComponents?: {
    surfaceId: string;
    components: SampleComponent[];
  };
}

export function operationsToFenceLines(
  operations: A2UIOperation[],
  target?: string,
): string {
  const header = target ? `\`\`\`a2ui target=${target}` : "```a2ui";
  const body = operations.map((op) => JSON.stringify(op)).join("\n");
  return `${header}\n${body}\n\`\`\``;
}

export function buildChatSurfaceReply(
  intro: string,
  surfaceId: string,
  components: SampleComponent[],
  data?: Record<string, unknown>,
): string {
  const ops: A2UIOperation[] = [
    {
      version: A2UI_VERSION,
      createSurface: { surfaceId, catalogId: CATALOG_ID },
    },
  ];
  if (data) {
    ops.push({
      version: A2UI_VERSION,
      updateDataModel: { surfaceId, path: "/", value: data },
    });
  }
  ops.push({
    version: A2UI_VERSION,
    updateComponents: { surfaceId, components },
  });
  return `${intro}\n\n${operationsToFenceLines(ops)}\n`;
}

export function buildTargetSurfaceFence(
  targetId: string,
  surfaceId: string,
  components: SampleComponent[],
  data?: Record<string, unknown>,
): string {
  const ops: A2UIOperation[] = [
    {
      version: A2UI_VERSION,
      createSurface: { surfaceId, catalogId: CATALOG_ID },
    },
  ];
  if (data) {
    ops.push({
      version: A2UI_VERSION,
      updateDataModel: { surfaceId, path: "/", value: data },
    });
  }
  ops.push({
    version: A2UI_VERSION,
    updateComponents: { surfaceId, components },
  });
  return operationsToFenceLines(ops, targetId);
}

export function extractA2uiFenceBodies(markdown: string): string[] {
  const re = /```a2ui(?:[^\n]*)\n([\s\S]*?)```/g;
  const bodies: string[] = [];
  for (const match of markdown.matchAll(re)) {
    if (match[1]) bodies.push(match[1].trim());
  }
  return bodies;
}

export function parseA2uiLines(body: string): A2UIOperation[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as A2UIOperation);
}

export function previewSurfaceId(componentName: string): string {
  return `preview-${componentName}`;
}

export function previewOperations(
  componentName: string,
  components: SampleComponent[],
  data?: Record<string, unknown>,
): A2UIOperation[] {
  const surfaceId = previewSurfaceId(componentName);
  const ops: A2UIOperation[] = [
    {
      version: A2UI_VERSION,
      createSurface: { surfaceId, catalogId: CATALOG_ID },
    },
  ];
  if (data) {
    ops.push({
      version: A2UI_VERSION,
      updateDataModel: { surfaceId, path: "/", value: data },
    });
  }
  ops.push({
    version: A2UI_VERSION,
    updateComponents: { surfaceId, components },
  });
  return ops;
}

/** Minimal live preview tree for a single catalog component name. */
export function minimalPreviewTree(
  componentName: string,
): { components: SampleComponent[]; data?: Record<string, unknown> } {
  switch (componentName) {
    case "Badge":
      return {
        components: [
          { id: "root", component: "Column", children: ["b"] },
          { id: "b", component: "Badge", label: "Catalog", color: "info" },
        ],
      };
    case "Slider":
      return {
        components: [
          { id: "root", component: "Card", children: ["s", "t"] },
          {
            id: "s",
            component: "Slider",
            label: "Preview value",
            min: 0,
            max: 100,
            value: { "@path": "/value" },
          },
          {
            id: "t",
            component: "Text",
            text: { "@path": "/label" },
          },
        ],
        data: { value: 42, label: "42" },
      };
    case "Chart":
      return {
        components: [
          {
            id: "root",
            component: "Chart",
            chartType: "bar",
            data: [
              { label: "A", value: 10 },
              { label: "B", value: 16 },
            ],
          },
        ],
      };
    case "Table":
      return {
        components: [
          {
            id: "root",
            component: "Table",
            children: ["head", "row1"],
          },
          {
            id: "head",
            component: "TableSection",
            variant: "head",
            children: ["h1", "h2"],
          },
          { id: "h1", component: "TableCell", children: ["ht1"] },
          { id: "ht1", component: "Text", text: "Name", fontWeight: "medium" },
          { id: "h2", component: "TableCell", children: ["ht2"] },
          { id: "ht2", component: "Text", text: "Score", fontWeight: "medium" },
          {
            id: "row1",
            component: "TableRow",
            children: ["c1", "c2"],
          },
          { id: "c1", component: "TableCell", children: ["t1"] },
          { id: "t1", component: "Text", text: "Ada" },
          { id: "c2", component: "TableCell", children: ["t2"] },
          { id: "t2", component: "Text", text: "98" },
        ],
      };
    case "Map":
      return {
        components: [
          {
            id: "root",
            component: "Map",
            places: [
              {
                id: "sf",
                name: "San Francisco",
                latitude: 37.7749,
                longitude: -122.4194,
              },
            ],
          },
        ],
      };
    case "Image":
    case "Video":
    case "AudioPlayer":
      return {
        components: [
          { id: "root", component: "Column", children: ["cap"] },
          {
            id: "cap",
            component: "Caption",
            text: `${componentName}: schema only in this demo (no remote media).`,
          },
        ],
      };
    case "Svg":
      return {
        components: [
          { id: "root", component: "Column", children: ["svg"] },
          {
            id: "svg",
            component: "Svg",
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>',
          },
        ],
      };
    case "Icon":
      return {
        components: [
          { id: "root", component: "Row", gap: 2, children: ["i", "t"] },
          { id: "i", component: "Icon", name: "sparkles" },
          { id: "t", component: "Text", text: "Icon preview" },
        ],
      };
    case "Form":
      return {
        components: [
          {
            id: "root",
            component: "Form",
            children: ["email"],
          },
          {
            id: "email",
            component: "TextField",
            label: "Email",
            inputType: "email",
            value: { "@path": "/email" },
            required: true,
          },
        ],
        data: { email: "you@example.com" },
      };
    case "TextField":
      return {
        components: [
          { id: "root", component: "Column", children: ["f"] },
          {
            id: "f",
            component: "TextField",
            label: "Name",
            value: { "@path": "/name" },
          },
        ],
        data: { name: "CopilotKit" },
      };
    case "Tabs":
      return {
        components: [
          {
            id: "root",
            component: "Tabs",
            tabs: [
              { title: "One", child: "a" },
              { title: "Two", child: "b" },
            ],
            children: ["a", "b"],
          },
          { id: "a", component: "Text", text: "Tab one" },
          { id: "b", component: "Text", text: "Tab two" },
        ],
      };
    default:
      return {
        components: [
          { id: "root", component: "Card", children: ["t"] },
          {
            id: "t",
            component: "Text",
            text: `${componentName} — select props in the schema panel.`,
          },
        ],
      };
  }
}
