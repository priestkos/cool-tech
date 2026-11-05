import { describe, expect, test } from "bun:test"
import { clampConfig, DEFAULT_CONFIG } from "./config"
import { generateWalletSnippet } from "./snippet"

describe("snippet generator", () => {
  test("is deterministic and uses composition", () => {
    const cfg = clampConfig(DEFAULT_CONFIG)
    const a = generateWalletSnippet(cfg)
    const b = generateWalletSnippet(cfg)
    expect(a.jsx).toBe(b.jsx)
    expect(a.jsx).toContain("WalletPocket")
    expect(a.jsx).toContain("WalletCardTitle")
    expect(a.install).toContain("@ncdai/wallet")
  })

  test("escapes user text in JSX text nodes", () => {
    const cfg = clampConfig({
      ...DEFAULT_CONFIG,
      pocketLabel: `Label <script>`,
      cards: [
        {
          title: `{peek}`,
          description: "ok",
          content: "end ${tag}",
          colorClass: "bg-sky-600 text-white",
        },
      ],
    })
    const { jsx } = generateWalletSnippet(cfg)
    expect(jsx).toContain(JSON.stringify(`Label <script>`))
    expect(jsx).toContain(JSON.stringify("{peek}"))
  })
})
