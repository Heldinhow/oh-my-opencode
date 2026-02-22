import { describe, test, expect } from "bun:test"
import { migrateAgentNames } from "./migration"
import { getAgentDisplayName } from "./agent-display-names"
import { AGENT_MODEL_REQUIREMENTS } from "./model-requirements"

describe("Agent Config Integration", () => {
  describe("Old format config migration", () => {
    test("migrates old format agent keys to lowercase", () => {
      // given - config with old format keys
      const oldConfig = {
        Invoker: { model: "anthropic/claude-opus-4-6" },
        Axe: { model: "anthropic/claude-opus-4-6" },
        "Tinker (Planner)": { model: "anthropic/claude-opus-4-6" },
        "Rubick (Plan Consultant)": { model: "anthropic/claude-sonnet-4-5" },
        "Clockwerk (Plan Reviewer)": { model: "anthropic/claude-sonnet-4-5" },
      }

      // when - migration is applied
      const result = migrateAgentNames(oldConfig)

      // then - keys are lowercase
      expect(result.migrated).toHaveProperty("invoker")
      expect(result.migrated).toHaveProperty("axe")
      expect(result.migrated).toHaveProperty("tinker")
      expect(result.migrated).toHaveProperty("rubick")
      expect(result.migrated).toHaveProperty("clockwerk")

      // then - old keys are removed
      expect(result.migrated).not.toHaveProperty("Invoker")
      expect(result.migrated).not.toHaveProperty("Axe")
      expect(result.migrated).not.toHaveProperty("Tinker (Planner)")
      expect(result.migrated).not.toHaveProperty("Rubick (Plan Consultant)")
      expect(result.migrated).not.toHaveProperty("Clockwerk (Plan Reviewer)")

      // then - values are preserved
      expect(result.migrated.invoker).toEqual({ model: "anthropic/claude-opus-4-6" })
      expect(result.migrated.axe).toEqual({ model: "anthropic/claude-opus-4-6" })
      expect(result.migrated.tinker).toEqual({ model: "anthropic/claude-opus-4-6" })
      
      // then - changed flag is true
      expect(result.changed).toBe(true)
    })

    test("preserves already lowercase keys", () => {
      // given - config with lowercase keys
      const config = {
        invoker: { model: "anthropic/claude-opus-4-6" },
        oracle: { model: "openai/gpt-5.2" },
        keeper: { model: "opencode/glm-4.7-free" },
      }

      // when - migration is applied
      const result = migrateAgentNames(config)

      // then - keys remain unchanged
      expect(result.migrated).toEqual(config)
      
      // then - changed flag is false
      expect(result.changed).toBe(false)
    })

    test("handles mixed case config", () => {
      // given - config with mixed old and new format
      const mixedConfig = {
        Invoker: { model: "anthropic/claude-opus-4-6" },
        oracle: { model: "openai/gpt-5.2" },
        "Tinker (Planner)": { model: "anthropic/claude-opus-4-6" },
        keeper: { model: "opencode/glm-4.7-free" },
      }

      // when - migration is applied
      const result = migrateAgentNames(mixedConfig)

      // then - all keys are lowercase
      expect(result.migrated).toHaveProperty("invoker")
      expect(result.migrated).toHaveProperty("oracle")
      expect(result.migrated).toHaveProperty("tinker")
      expect(result.migrated).toHaveProperty("keeper")
      expect(Object.keys(result.migrated).every((key) => key === key.toLowerCase())).toBe(true)
      
      // then - changed flag is true
      expect(result.changed).toBe(true)
    })
  })

  describe("Display name resolution", () => {
    test("returns correct display names for all builtin agents", () => {
      // given - lowercase config keys
      const agents = ["invoker", "axe", "tinker", "rubick", "clockwerk", "oracle", "keeper", "mirana", "broodmother"]

      // when - display names are requested
      const displayNames = agents.map((agent) => getAgentDisplayName(agent))

      // then - display names are correct
      expect(displayNames).toContain("Invoker (Ultraworker)")
      expect(displayNames).toContain("Axe (Plan Execution Orchestrator)")
      expect(displayNames).toContain("Tinker (Plan Builder)")
      expect(displayNames).toContain("Rubick (Plan Consultant)")
      expect(displayNames).toContain("Clockwerk (Plan Reviewer)")
      expect(displayNames).toContain("oracle")
      expect(displayNames).toContain("keeper")
      expect(displayNames).toContain("mirana")
      expect(displayNames).toContain("broodmother")
    })

    test("handles lowercase keys case-insensitively", () => {
      // given - various case formats of lowercase keys
      const keys = ["Invoker", "Axe", "SISYPHUS", "axe", "tinker", "PROMETHEUS"]

      // when - display names are requested
      const displayNames = keys.map((key) => getAgentDisplayName(key))

      // then - correct display names are returned
      expect(displayNames[0]).toBe("Invoker (Ultraworker)")
      expect(displayNames[1]).toBe("Axe (Plan Execution Orchestrator)")
      expect(displayNames[2]).toBe("Invoker (Ultraworker)")
      expect(displayNames[3]).toBe("Axe (Plan Execution Orchestrator)")
      expect(displayNames[4]).toBe("Tinker (Plan Builder)")
      expect(displayNames[5]).toBe("Tinker (Plan Builder)")
    })

    test("returns original key for unknown agents", () => {
      // given - unknown agent key
      const unknownKey = "custom-agent"

      // when - display name is requested
      const displayName = getAgentDisplayName(unknownKey)

      // then - original key is returned
      expect(displayName).toBe(unknownKey)
    })
  })

  describe("Model requirements integration", () => {
    test("all model requirements use lowercase keys", () => {
      // given - AGENT_MODEL_REQUIREMENTS object
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)

      // when - checking key format
      const allLowercase = agentKeys.every((key) => key === key.toLowerCase())

      // then - all keys are lowercase
      expect(allLowercase).toBe(true)
    })

    test("model requirements include all builtin agents", () => {
      // given - expected builtin agents
      const expectedAgents = ["invoker", "axe", "tinker", "rubick", "clockwerk", "oracle", "keeper", "mirana", "broodmother"]

      // when - checking AGENT_MODEL_REQUIREMENTS
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)

      // then - all expected agents are present
      for (const agent of expectedAgents) {
        expect(agentKeys).toContain(agent)
      }
    })

    test("no uppercase keys in model requirements", () => {
      // given - AGENT_MODEL_REQUIREMENTS object
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)

      // when - checking for uppercase keys
      const uppercaseKeys = agentKeys.filter((key) => key !== key.toLowerCase())

      // then - no uppercase keys exist
      expect(uppercaseKeys).toEqual([])
    })
  })

  describe("End-to-end config flow", () => {
    test("old config migrates and displays correctly", () => {
      // given - old format config
      const oldConfig = {
        Invoker: { model: "anthropic/claude-opus-4-6", temperature: 0.1 },
        "Tinker (Planner)": { model: "anthropic/claude-opus-4-6" },
      }

      // when - config is migrated
      const result = migrateAgentNames(oldConfig)

      // then - keys are lowercase
      expect(result.migrated).toHaveProperty("invoker")
      expect(result.migrated).toHaveProperty("tinker")

      // when - display names are retrieved
      const invokerDisplay = getAgentDisplayName("invoker")
      const tinkerDisplay = getAgentDisplayName("tinker")

      // then - display names are correct
      expect(invokerDisplay).toBe("Invoker (Ultraworker)")
      expect(tinkerDisplay).toBe("Tinker (Plan Builder)")

      // then - config values are preserved
      expect(result.migrated.invoker).toEqual({ model: "anthropic/claude-opus-4-6", temperature: 0.1 })
      expect(result.migrated.tinker).toEqual({ model: "anthropic/claude-opus-4-6" })
    })

    test("new config works without migration", () => {
      // given - new format config (already lowercase)
      const newConfig = {
        invoker: { model: "anthropic/claude-opus-4-6" },
        axe: { model: "anthropic/claude-opus-4-6" },
      }

      // when - migration is applied (should be no-op)
      const result = migrateAgentNames(newConfig)

      // then - config is unchanged
      expect(result.migrated).toEqual(newConfig)
      
      // then - changed flag is false
      expect(result.changed).toBe(false)

      // when - display names are retrieved
      const invokerDisplay = getAgentDisplayName("invoker")
      const axeDisplay = getAgentDisplayName("axe")

      // then - display names are correct
      expect(invokerDisplay).toBe("Invoker (Ultraworker)")
      expect(axeDisplay).toBe("Axe (Plan Execution Orchestrator)")
    })
  })
})
