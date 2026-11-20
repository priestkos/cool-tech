/** Lab field types aligned with SignuDoc @ 23add989 field placement schema (subset). */
export const labFieldTypes = [
  "signature",
  "initials",
  "date",
  "text",
  "name",
] as const

export type LabFieldType = (typeof labFieldTypes)[number]

export type FieldPlacement = {
  id: string
  signerId: string
  type: LabFieldType
  page: number
  x: number
  y: number
  width: number
  height: number
  required: boolean
  label?: string
}

export type FieldValue = {
  inputMethod?: "typed" | "drawn"
  value?: string
  imageDataUrl?: string
  submittedAt?: number
}

export type FieldRecord = FieldPlacement & FieldValue

export const defaultFieldSize: Record<
  LabFieldType,
  { height: number; width: number }
> = {
  signature: { height: 0.08, width: 0.22 },
  initials: { height: 0.05, width: 0.1 },
  date: { height: 0.04, width: 0.14 },
  text: { height: 0.04, width: 0.2 },
  name: { height: 0.04, width: 0.18 },
}