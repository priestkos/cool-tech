import { z } from "zod";

export type ControlKind = "color" | "color-array" | "number" | "boolean" | "enum" | "string" | "skip";

export type SchemaControl = {
  key: string;
  kind: ControlKind;
  label: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
};

function unwrap(field: z.ZodTypeAny): z.ZodTypeAny {
  if (field instanceof z.ZodDefault) {
    return unwrap(field.removeDefault() as z.ZodTypeAny);
  }
  if (field instanceof z.ZodOptional) {
    return unwrap(field.unwrap() as z.ZodTypeAny);
  }
  return field;
}

function isColorField(key: string, hint: string): boolean {
  const blob = `${key} ${hint}`.toLowerCase();
  return (
    blob.includes("colour") ||
    blob.includes("color") ||
    key === "accent" ||
    key === "background" ||
    key === "surface"
  );
}

/** Map a hero config zod object schema to UI control metadata. */
export function schemaToControls(schema: z.ZodObject<z.ZodRawShape>): SchemaControl[] {
  const controls: SchemaControl[] = [];

  for (const [key, rawField] of Object.entries(schema.shape)) {
    const field = unwrap(rawField as z.ZodTypeAny);
    const hint = (rawField as z.ZodTypeAny).description ?? field.description;

    if (key === "poster") {
      controls.push({ key, kind: "skip", label: key, hint });
      continue;
    }

    if (field instanceof z.ZodArray && field.element instanceof z.ZodString) {
      controls.push({
        key,
        kind: "color-array",
        label: key,
        hint,
      });
      continue;
    }

    if (field instanceof z.ZodEnum) {
      controls.push({
        key,
        kind: "enum",
        label: key,
        hint,
        options: field.options.map(String),
      });
      continue;
    }

    if (field instanceof z.ZodBoolean) {
      controls.push({ key, kind: "boolean", label: key, hint });
      continue;
    }

    if (field instanceof z.ZodNumber) {
      controls.push({
        key,
        kind: "number",
        label: key,
        hint,
        min: field.minValue ?? 0,
        max: field.maxValue ?? 100,
        step: Number.isInteger(field.minValue) && Number.isInteger(field.maxValue) ? 1 : 0.05,
      });
      continue;
    }

    if (field instanceof z.ZodString) {
      controls.push({
        key,
        kind: isColorField(key, hint ?? "") ? "color" : "string",
        label: key,
        hint,
      });
      continue;
    }

    controls.push({ key, kind: "skip", label: key, hint });
  }

  return controls;
}

export function getSchemaDefaults<T extends z.ZodRawShape>(schema: z.ZodObject<T>): z.infer<z.ZodObject<T>> {
  return schema.parse({}) as z.infer<z.ZodObject<T>>;
}
