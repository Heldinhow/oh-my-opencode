import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoriesConfig, CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS } from "../../shared"
import { applyOverrides } from "./agent-overrides"
import { applyModelResolution } from "./model-resolution"
import { createAxeAgent } from "../axe"

export function maybeCreateAxeConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  uiSelectedModel?: string
  availableModels: Set<string>
  systemDefaultModel?: string
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  userCategories?: CategoriesConfig
  useTaskSystem?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    availableAgents,
    availableSkills,
    mergedCategories,
    directory,
    userCategories,
  } = input

  if (disabledAgents.includes("axe")) return undefined

  const orchestratorOverride = agentOverrides["axe"]
  const axeRequirement = AGENT_MODEL_REQUIREMENTS["axe"]

  const axeResolution = applyModelResolution({
    uiSelectedModel: orchestratorOverride?.model ? undefined : uiSelectedModel,
    userModel: orchestratorOverride?.model,
    requirement: axeRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (!axeResolution) return undefined
  const { model: axeModel, variant: axeResolvedVariant } = axeResolution

  let orchestratorConfig = createAxeAgent({
    model: axeModel,
    availableAgents,
    availableSkills,
    userCategories,
  })

  if (axeResolvedVariant) {
    orchestratorConfig = { ...orchestratorConfig, variant: axeResolvedVariant }
  }

  orchestratorConfig = applyOverrides(orchestratorConfig, orchestratorOverride, mergedCategories, directory)

  return orchestratorConfig
}
