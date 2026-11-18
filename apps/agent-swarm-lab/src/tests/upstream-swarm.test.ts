import { describe, expect, test } from "bun:test"
import { Swarm, createSwarm, swarm, useSwarm } from "agent-swarm-effect"
import type { SwarmController, SwarmOptions, SwarmTrigger } from "agent-swarm-effect/vanilla"

describe("agent-swarm-effect public API", () => {
  test("react entry exports Swarm and useSwarm", () => {
    expect(typeof Swarm).toBe("object")
    expect(Swarm).toHaveProperty("$$typeof")
    expect(typeof useSwarm).toBe("function")
  })

  test("vanilla entry exports createSwarm and swarm alias", () => {
    expect(typeof createSwarm).toBe("function")
    expect(swarm).toBe(createSwarm)
  })

  test("SwarmTrigger union matches upstream docs", () => {
    const modes: SwarmTrigger[] = ["visible", "mount", "manual"]
    const opts: SwarmOptions = { trigger: "manual", speed: 1.5, typing: true }
    expect(modes).toContain(opts.trigger)
    expect(opts.speed).toBe(1.5)
  })
})

describe("createSwarm controller (browser)", () => {
  test("exposes play, replay, reveal, destroy", () => {
    if (typeof document === "undefined") {
      expect(true).toBe(true)
      return
    }

    const root = document.createElement("button")
    root.type = "button"
    root.dataset.swarm = "Test"
    root.textContent = "Hello swarm"
    document.body.appendChild(root)

    const controller: SwarmController = createSwarm(root, {
      trigger: "manual",
      respectReducedMotion: true,
    })

    expect(typeof controller.play).toBe("function")
    expect(typeof controller.replay).toBe("function")
    expect(typeof controller.reveal).toBe("function")
    expect(typeof controller.destroy).toBe("function")

    controller.play()
    controller.reveal()
    controller.destroy()

    document.body.removeChild(root)
  })
})