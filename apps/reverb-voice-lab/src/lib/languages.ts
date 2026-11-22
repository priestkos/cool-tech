import type { ReverbLanguage } from "runntime/zoo"

export const LANGUAGE_OPTIONS: {
  code: ReverbLanguage
  label: string
}[] = [
  { code: "en", label: "English (EN)" },
  { code: "de", label: "German (DE)" },
  { code: "fr", label: "French (FR)" },
  { code: "es", label: "Spanish (ES)" },
  { code: "it", label: "Italian (IT)" },
  { code: "pl", label: "Polish (PL)" },
  { code: "pt", label: "Portuguese (PT)" },
]