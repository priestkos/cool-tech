export type Language = "js" | "ts" | "jsx" | "tsx" | "css" | "json"
export type TrailingComma = "all" | "es5" | "none"

export type FormatOptionsInput = Record<string, unknown> & {
  semi?: boolean
  singleQuote?: boolean
  printWidth?: number
  tabWidth?: number
  trailingComma?: TrailingComma
}

export const LANGUAGE_EXT: Record<Language, string> = {
  js: "js",
  ts: "ts",
  jsx: "jsx",
  tsx: "tsx",
  css: "css",
  json: "json",
}

const ALLOWED_KEYS = new Set([
  "semi",
  "singleQuote",
  "printWidth",
  "tabWidth",
  "trailingComma",
])

export function languageToExtension(language: string): Language | null {
  if (language in LANGUAGE_EXT) {
    return language as Language
  }
  return null
}

export type BuildFlagsResult =
  | { ok: true; flags: string[]; errors: [] }
  | { ok: false; flags: string[]; errors: string[] }

export function buildFmtFlags(options: FormatOptionsInput = {}): BuildFlagsResult {
  const flags: string[] = []
  const errors: string[] = []

  for (const [key, value] of Object.entries(options)) {
    if (!ALLOWED_KEYS.has(key)) {
      continue
    }
    if (value === undefined) {
      continue
    }

    switch (key) {
      case "semi":
        if (value === false) {
          flags.push("--no-semi")
        }
        break
      case "singleQuote":
        if (value === true) {
          flags.push("--single-quote")
        }
        break
      case "printWidth": {
        const w = value
        if (typeof w !== "number" || !Number.isInteger(w) || w < 40 || w > 160) {
          errors.push("printWidth must be an integer between 40 and 160")
        } else {
          flags.push(`--print-width=${w}`)
        }
        break
      }
      case "tabWidth": {
        if (value !== 2 && value !== 4) {
          errors.push("tabWidth must be 2 or 4")
        } else {
          flags.push(`--tab-width=${value}`)
        }
        break
      }
      case "trailingComma": {
        if (value !== "all" && value !== "es5" && value !== "none") {
          errors.push("trailingComma must be all, es5, or none")
        } else {
          flags.push(`--trailing-comma=${value}`)
        }
        break
      }
      default:
        break
    }
  }

  if (errors.length > 0) {
    return { ok: false, flags, errors }
  }
  return { ok: true, flags, errors: [] }
}

export function buildCommandPreview(flags: string[], ext: string): string {
  const flagPart = flags.length > 0 ? `${flags.join(" ")} ` : ""
  return `bun fmt --no-config --no-editorconfig ${flagPart}input.${ext}`.replace(/\s+/g, " ").trim()
}
