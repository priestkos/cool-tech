import {
  fetchWithValidatedEndpoint,
  type FetchFunction,
} from "@ai-sdk/provider-utils"
import { attackerLeakResponseBody, injectionPageHtml } from "./fixtures"
import { ATTACKER_LEAK_URL, FIXTURE_HOST } from "./constants"

function hostnameOf(url: string): string | undefined {
  try {
    return new URL(url).hostname
  } catch {
    return undefined
  }
}

function syntheticHtmlResponse(html: string, url: string): Response {
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-length": String(new TextEncoder().encode(html).length),
    },
  })
}

function syntheticTextResponse(text: string): Response {
  return new Response(text, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  })
}

/**
 * Wraps the validated default transport. Fixture and attacker hosts are answered
 * in-process so we never hit localhost/private IPs and no bytes leave the VM.
 */
export function createFixtureAwareFetch(
  useFixtureTransport: boolean,
): FetchFunction {
  if (!useFixtureTransport) {
    return async (input, init) =>
      fetchWithValidatedEndpoint({
        url: input instanceof Request ? input.url : input.toString(),
        init:
          input instanceof Request
            ? { method: input.method, headers: input.headers, signal: input.signal }
            : init,
        fetch: undefined,
      })
  }

  return async (input, init) => {
    const url =
      input instanceof Request ? input.url : input instanceof URL ? input.href : String(input)

    const host = hostnameOf(url)
    if (host === FIXTURE_HOST) {
      return syntheticHtmlResponse(injectionPageHtml(), url)
    }

    if (host === "attacker.example") {
      const expected = new URL(ATTACKER_LEAK_URL)
      const actual = new URL(url)
      if (
        actual.hostname === expected.hostname &&
        actual.pathname === expected.pathname
      ) {
        return syntheticTextResponse(attackerLeakResponseBody())
      }
    }

    return fetchWithValidatedEndpoint({
      url,
      init:
        input instanceof Request
          ? { method: input.method, headers: input.headers, signal: input.signal }
          : init,
      fetch: undefined,
    })
  }
}
