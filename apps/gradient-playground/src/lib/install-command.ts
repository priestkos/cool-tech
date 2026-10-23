const REGISTRY_BASE = 'https://gradients.sh/r'

/** Registry slug for `npx shadcn@latest add https://gradients.sh/r/<slug>.json`. */
export function installCommand(registrySlug: string): string {
  const slug = registrySlug.trim()
  if (!slug || slug.includes('/') || slug.includes(' ')) {
    throw new Error('Invalid gradients.sh registry slug')
  }
  return `npx shadcn@latest add ${REGISTRY_BASE}/${slug}.json`
}
