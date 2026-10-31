import { standardUI } from "@copilotkit/react-core/v2/generative-ui";
import type { z } from "zod";

export type ManifestComponent =
  (typeof standardUI.manifestComponents)[string];

export function listCatalogComponentNames(): string[] {
  return Object.keys(standardUI.manifestComponents).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function catalogComponentCount(): number {
  return listCatalogComponentNames().length;
}

export function getManifest(name: string): ManifestComponent | undefined {
  return standardUI.manifestComponents[name];
}

export function getComponentPropsSchema(name: string): z.ZodTypeAny | undefined {
  return standardUI.components.get(name)?.props as z.ZodTypeAny | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function schemaTypeLabel(schema: Record<string, unknown>): string {
  if (Array.isArray(schema.enum)) return schema.enum.map(String).join(" | ");
  if (typeof schema.type === "string") return schema.type;
  if (Array.isArray(schema.type)) return schema.type.join(" | ");
  return "union";
}

export interface PropSchemaRow {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export function manifestPropRows(manifest: ManifestComponent): PropSchemaRow[] {
  const properties = isRecord(manifest.props.properties)
    ? manifest.props.properties
    : {};
  const required = new Set(
    Array.isArray(manifest.props.required)
      ? manifest.props.required.filter((x): x is string => typeof x === "string")
      : [],
  );
  return Object.entries(properties).map(([name, schema]) => {
    if (!isRecord(schema)) {
      return { name, type: "unknown", required: required.has(name) };
    }
    const description =
      typeof schema.description === "string" ? schema.description : undefined;
    return {
      name,
      type: schemaTypeLabel(schema),
      required: required.has(name),
      description,
    };
  });
}

export function validateComponentProps(
  componentName: string,
  props: Record<string, unknown>,
) {
  const schema = getComponentPropsSchema(componentName);
  if (!schema) {
    return { success: false as const, error: `Unknown component ${componentName}` };
  }
  const result = schema.safeParse(props);
  if (result.success) return { success: true as const };
  return { success: false as const, error: result.error.message };
}

function isDataBinding(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "@path" in value &&
    typeof (value as { "@path": unknown })["@path"] === "string"
  );
}

/** Validates literal props; A2UI data bindings (`{ "@path": "..." }`) are allowed. */
export function validateA2uiComponentNode(node: {
  component: string;
  [key: string]: unknown;
}) {
  const { component, id, children, ...rest } = node;
  void id;
  void children;
  const literalProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (!isDataBinding(value)) literalProps[key] = value;
  }
  return validateComponentProps(component, literalProps);
}
