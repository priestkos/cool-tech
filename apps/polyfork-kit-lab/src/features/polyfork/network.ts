export const POLYFORK_CDN_HOST = "polyfork.dev"

export function isPolyforkOrigin(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === POLYFORK_CDN_HOST || host.endsWith(`.${POLYFORK_CDN_HOST}`)
  } catch {
    return false
  }
}

export function assertLiveFetchAllowed(
  networkMode: "offline" | "live",
  url: string
): void {
  if (networkMode === "offline") {
    throw new Error(`Offline mode blocks fetch: ${url}`)
  }
  if (!isPolyforkOrigin(url)) {
    throw new Error(`Live mode only allows polyfork.dev: ${url}`)
  }
}

export async function guardedFetch(
  networkMode: "offline" | "live",
  url: string,
  init?: RequestInit
): Promise<Response> {
  assertLiveFetchAllowed(networkMode, url)
  return fetch(url, init)
}