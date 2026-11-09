/// <reference types="vite/client" />

declare module "*.md?raw" {
  const content: string
  export default content
}

declare module "*report-schema.json" {
  const schema: Record<string, unknown>
  export default schema
}

declare module "*validate-findings.cjs" {
  export function validateDocument(data: unknown, schema: unknown): string[]
}

declare module "*validate-coverage-ledger.cjs" {
  export function validateDocument(data: unknown): string[]
}

declare module "*/validate-findings.bundle.js" {
  const mod: { validateDocument: (data: unknown, schema?: unknown) => string[] }
  export default mod
}

declare module "*/validate-coverage-ledger.bundle.js" {
  const mod: { validateDocument: (data: unknown) => string[] }
  export default mod
}
