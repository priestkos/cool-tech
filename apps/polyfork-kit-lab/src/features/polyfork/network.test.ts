import { describe, expect, test } from "bun:test"
import { assertLiveFetchAllowed, isPolyforkOrigin } from "./network"

describe("polyfork origin gate", () => {
  test("allows the apex host and its subdomains", () => {
    expect(isPolyforkOrigin("https://polyfork.dev/cdn/a.glb")).toBe(true)
    expect(isPolyforkOrigin("https://cdn.polyfork.dev/a.glb")).toBe(true)
    expect(isPolyforkOrigin("https://a.b.polyfork.dev/x")).toBe(true)
  })

  test("rejects lookalikes, other hosts, and unparseable URLs", () => {
    expect(isPolyforkOrigin("https://polyfork.dev.evil.com/a")).toBe(false)
    expect(isPolyforkOrigin("https://notpolyfork.dev/a")).toBe(false)
    expect(isPolyforkOrigin("https://evil.com/polyfork.dev")).toBe(false)
    expect(isPolyforkOrigin("not a url")).toBe(false)
    expect(isPolyforkOrigin("")).toBe(false)
  })

  test("live mode fetches only polyfork origins", () => {
    expect(() => assertLiveFetchAllowed("live", "https://polyfork.dev/cdn/a.glb")).not.toThrow()
    expect(() => assertLiveFetchAllowed("live", "https://cdn.polyfork.dev/a.glb")).not.toThrow()
    expect(() => assertLiveFetchAllowed("live", "https://notpolyfork.dev/a.glb")).toThrow(/polyfork\.dev/)
    expect(() => assertLiveFetchAllowed("offline", "https://polyfork.dev/a.glb")).toThrow(/Offline mode/)
  })
})
