import { describe, expect, it } from "bun:test"
import { handleChatRequest } from "./chat-handler"
import { FIXTURE_INJECTION_URL } from "./constants"

describe("injection demo", () => {
  it("blocks attacker fetch when allow-list is enabled", async () => {
    const result = await handleChatRequest({
      message: `Please read ${FIXTURE_INJECTION_URL}`,
      injectionDemo: true,
      useRealModel: false,
      useFixtureTransport: true,
      safety: {
        allowedDomains: ["fixture.web-fetch-lab.example"],
        requireUrlInUserMessage: false,
      },
    })

    expect(result.injectionOutcome).toBe("blocked")
  })

  it("shows leak when safety switches are off", async () => {
    const result = await handleChatRequest({
      message: `Please read ${FIXTURE_INJECTION_URL}`,
      injectionDemo: true,
      useRealModel: false,
      useFixtureTransport: true,
      safety: {},
    })

    expect(result.injectionOutcome).toBe("leaked")
  })
})
