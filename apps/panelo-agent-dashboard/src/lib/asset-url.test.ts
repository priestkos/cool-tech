import { describe, expect, test } from "bun:test"
import { assetUrl } from "./asset-url"

describe("assetUrl", () => {
  test("root base strips a leading slash", () => {
    expect(assetUrl("/", "/avatars/jaydon-aminoff.webp")).toBe("/avatars/jaydon-aminoff.webp")
  })

  test("deployed base keeps the app prefix", () => {
    expect(assetUrl("/apps/panelo-agent-dashboard/", "/avatars/jaydon-aminoff.webp")).toBe(
      "/apps/panelo-agent-dashboard/avatars/jaydon-aminoff.webp",
    )
  })

  test("relative asset path is joined as given", () => {
    expect(assetUrl("/apps/panelo-agent-dashboard/", "avatars/x.webp")).toBe(
      "/apps/panelo-agent-dashboard/avatars/x.webp",
    )
  })

  test("empty asset path leaves the base", () => {
    expect(assetUrl("/", "")).toBe("/")
  })
})
