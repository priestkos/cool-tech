/** Prefix a public asset path with Vite's base. Leading slash on `assetPath` is stripped so `/` + `/avatars/x` stays `/avatars/x`. */
export function assetUrl(base: string, assetPath: string): string {
  return `${base}${assetPath.startsWith("/") ? assetPath.slice(1) : assetPath}`
}
