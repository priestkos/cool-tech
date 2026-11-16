export function slugName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-")
}

export function personId(name: string): string {
  return `person:${slugName(name)}`
}

export function companyId(name: string): string {
  return `company:${slugName(name)}`
}

export function relationKey(from: string, type: string, to: string): string {
  return `${from}|${type}|${to}`
}