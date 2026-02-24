import { describe, it, expect } from "bun:test"
import { AGENT_DISPLAY_NAMES, getAgentDisplayName } from "./agent-display-names"

describe("getAgentDisplayName", () => {
  it("returns display name for lowercase config key (new format)", () => {
    // given config key "invoker"
    const configKey = "invoker"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Invoker (Ultraworker)"
    expect(result).toBe("Invoker (Ultraworker)")
  })

  it("returns display name for uppercase config key (old format - case-insensitive)", () => {
    // given config key "Invoker" (old format)
    const configKey = "Invoker"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Invoker (Ultraworker)" (case-insensitive lookup)
    expect(result).toBe("Invoker (Ultraworker)")
  })

  it("returns original key for unknown agents (fallback)", () => {
    // given config key "custom-agent"
    const configKey = "custom-agent"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "custom-agent" (original key unchanged)
    expect(result).toBe("custom-agent")
  })

  it("returns display name for axe", () => {
    // given config key "axe"
    const configKey = "axe"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Axe (Plan Execution Orchestrator)"
    expect(result).toBe("Axe (Plan Execution Orchestrator)")
  })

  it("returns display name for tinker", () => {
    // given config key "tinker"
    const configKey = "tinker"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Tinker (Plan Builder)"
    expect(result).toBe("Tinker (Plan Builder)")
  })

  it("returns display name for invoker-junior", () => {
    // given config key "invoker-junior"
    const configKey = "invoker-junior"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Invoker-Junior"
    expect(result).toBe("Invoker-Junior")
  })

  it("returns display name for rubick", () => {
    // given config key "rubick"
    const configKey = "rubick"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Rubick (Plan Consultant)"
    expect(result).toBe("Rubick (Plan Consultant)")
  })

  it("returns display name for clockwerk", () => {
    // given config key "clockwerk"
    const configKey = "clockwerk"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Clockwerk (Plan Reviewer)"
    expect(result).toBe("Clockwerk (Plan Reviewer)")
  })

  it("returns display name for oracle", () => {
    // given config key "oracle"
    const configKey = "oracle"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "oracle"
    expect(result).toBe("oracle")
  })

  it("returns display name for keeper", () => {
    // given config key "keeper"
    const configKey = "keeper"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "keeper"
    expect(result).toBe("keeper")
  })

  it("returns display name for mirana", () => {
    // given config key "mirana"
    const configKey = "mirana"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "mirana"
    expect(result).toBe("mirana")
  })

  it("returns display name for broodmother", () => {
    // given config key "broodmother"
    const configKey = "broodmother"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "broodmother"
    expect(result).toBe("broodmother")
  })
})

describe("AGENT_DISPLAY_NAMES", () => {
  it("contains all expected agent mappings", () => {
    // given expected mappings
    const expectedMappings = {
      invoker: "Invoker (Ultraworker)",
      axe: "Axe (Plan Execution Orchestrator)",
      tinker: "Tinker (Plan Builder)",
      prometheus: "Tinker (Plan Builder)",
      sisyphus: "Invoker (Ultraworker)",
      omo: "Invoker (Ultraworker)",
      "invoker-junior": "Invoker-Junior",
      rubick: "Rubick (Plan Consultant)",
      clockwerk: "Clockwerk (Plan Reviewer)",
      oracle: "oracle",
      keeper: "keeper",
      mirana: "mirana",
      "broodmother": "broodmother",
      
    }

    // when checking the constant
    // then contains all expected mappings
    expect(AGENT_DISPLAY_NAMES).toEqual(expectedMappings)
  })
})
